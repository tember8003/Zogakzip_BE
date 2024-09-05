import express from 'express';
import postService from '../services/postService.js'; // 게시글 서비스
import commentService from '../services/commentService.js';

const postController = express.Router();


postController.put('/:id', async (req, res, next) => {//게시글 수정
	try {
		const postId = parseInt(req.params.id, 10);
		const inputPassword = req.body.password;
		if (!inputPassword) {
			return res.status(404).json({ message: '잘못된 요청입니다.' });
		}
		const postData = { ...req.body, password: inputPassword, id: postId };

		const post = await postService.updatePost(postData);
		return res.status(201).json(post);
	} catch (error) {
		if (error.code === 404) {
			res.status(404).json({ message: "존재하지 않습니다." });
		} else if (error.code === 403) {
			res.status(403).json({ message: "비밀번호가 틀렸습니다." });
		} else {
			return next(error);
		}
	}
});

postController.delete('/:id', async (req, res, next) => { // 게시글 삭제
	try {
		const postId = parseInt(req.params.id, 10); // 게시글 ID
		const password = req.body.postPassword; // 요청 본문에서 비밀번호 추출

		// 게시글 ID와 비밀번호가 제공되었는지 확인
		if (!postId || !password) {
			return res.status(400).json({ message: '잘못된 요청입니다. 게시글 ID와 비밀번호는 필수입니다.' });
		}

		// 게시글 삭제 서비스 호출
		const result = await postService.deletePost(postId, password);

		if (result) {
			return res.status(200).json({ message: '게시글 삭제 성공' });
		} else {
			return res.status(403).json({ message: '비밀번호가 틀렸습니다.' });
		}
	} catch (error) {
		if (error.code === 404) {
			return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
		} else if (error.code === 403) {
			return res.status(403).json({ message: '비밀번호가 틀렸습니다.' });
		} else {
			return next(error);
		}
	}
});

postController.get('/:id', async (req, res, next) => { // 게시글 상세 정보 조회
	try {
		const postId = parseInt(req.params.id, 10); // 추억(게시글) ID

		/*
		// 추억의 상세 정보와 댓글 목록을 동시에 가져옴
		const [post, comments] = await Promise.all([
			postService.getDetail(postId), // 추억(게시글) 상세 정보 조회
			commentService.getCommentsByPostId(postId) // 해당 추억의 댓글 목록 조회
		]);
		*/

		const post = await postService.getDetail(postId);

		// 추억의 공감 수 업데이트 (공감 보내기 버튼과 관련)
		//const updatedPost = await postService.updateLikeCount(postId);

		return res.status(200).json({
			post
			//comments, // 댓글 목록 포함 -> 미포함
		});
	} catch (error) {
		if (error.code === 404) {
			return res.status(404).json({ message: "존재하지 않습니다." });
		} else {
			return next(error);
		}
	}
});

//비밀번호 맞는지 확인
postController.post('/:id/verify-password', async (req, res, next) => {
	try {
		const postId = parseInt(req.params.id, 10);
		const password = req.body.password;

		if (!postId || !password) {
			return res.status(400).json({ message: '잘못된 요청입니다. 게시글 ID와 비밀번호는 필수입니다.' });
		}

		const message = await postService.verifyPassword(postId, password);

		res.status(200).json(message);
	} catch (error) {
		if (error.code === 403) {
			res.status(403).json({ message: "비밀번호가 틀렸습니다." });
		} else if (error.code === 404) {
			res.status(404).json({ message: "존재하지 않습니다." });
		}
		else {
			return next(error);
		}
	}
})

postController.post('/:id/like', async (req, res, next) => { // 게시글 공감하기
	try {
		const postId = parseInt(req.params.id, 10);

		// 게시글에 공감을 추가하는 서비스 호출
		const result = await postService.pushLike(postId);

		if (result) {
			res.status(200).json({ message: "게시글 공감하기 성공" });
		} else {
			res.status(500).json({ message: "게시글 공감하기 실패" });
		}
	} catch (error) {
		if (error.code === 404) {
			res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
		} else {
			return next(error);
		}
	}
});

postController.get('/:id/is-public', async (req, res, next) => { // 게시글 공개 여부 확인하기
	try {
		const postId = parseInt(req.params.id, 10);

		// 게시글의 공개 여부를 확인하는 서비스 호출
		const post = await postService.getPublicStatus(postId);

		return res.status(200).json(post);
	} catch (error) {
		if (error.code === 404) {
			res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
		} else {
			return next(error);
		}
	}
});

postController.post('/:id/comments', async (req, res, next) => {//댓글 등록
	try {
		const id = parseInt(req.params.id, 10);
		const { nickname, password, content } = req.body;

		if (!nickname || !password || !content) {
			return res.status(404).json({ message: '잘못된 요청입니다. - 닉네임과 비밀번호, 내용은 필수사항입니다.' });
		}

		const commentData = {
			nickname,
			password,
			content,
		}

		const comment = await commentService.addComment(commentData, id);
		return res.status(201).json(comment);
	} catch (error) {
		if (error.code === 422) {
			res.status(422).json({ message: "댓글 등록 중 오류 발생" })
		} else {
			return next(error);
		}
	}
});


postController.get('/:id/comments', async (req, res, next) => {  //댓글 상세 목록
	try {
		const postId = parseInt(req.params.id, 10);
		const page = parseInt(req.query.page) || 1;
		const pageSize = parseInt(req.query.pageSize) || 5;

		const result = await commentService.getComment(page, pageSize, postId);


		return res.json(result);

	} catch (error) {

		return next(error);
	}
});



export default postController;