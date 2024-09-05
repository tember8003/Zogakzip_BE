import express from 'express';
import commentService from '../services/commentService.js';


const commentController = express.Router();


commentController.post('/api/posts/{postId}/comments', async (req, res, next) => {//댓글 등록
    try {
        const {nickname, password, content } = req.body;

        if (!nickname || !password || !content) {
            return res.status(404).json({ message: '잘못된 요청입니다. - 닉네임과 비밀번호, 내용은 필수사항입니다.' });
        }

        const commentData = {
            nickname,
            password,
            content,
        }

        const comment = await commentService.createcomment(commentData);
        return res.status(201).json(comment);
    } catch (error) {
        if (error.code === 422) {
            res.status(422).json({ message: "댓글 등록 중 오류 발생" })
        } else {
            return next(error);
        }
    }
});
/////////////////////////
commentController.get('/api/posts/{postId}/comments', async (req, res, next) => {
	try {
			const memoryId = parseInt(req.params.memoryId, 10); // 추억 ID
			const page = parseInt(req.query.page) || 1; // 페이지 번호
			const pageSize = parseInt(req.query.pageSize) || 5; // 페이지 크기
			const sortBy = req.query.sortBy || 'createdAt'; // 정렬 기준 (기본값: 생성 날짜)
			const isPublic = req.query.isPublic !== undefined ? req.query.isPublic === 'true' : true; // 공개 여부

			// 댓글 목록 조회 함수 호출
			const result = await commentService.getList(memoryId, page, pageSize, sortBy, isPublic);

			// 성공적으로 조회된 댓글 목록을 JSON으로 응답
			return res.json(result);

	} catch (error) {
			// 에러 처리
			return next(error);
	}
});


commentController.put('/:id', async (req, res, next) => { //댓글 수정
	try {
			const commentId = parseInt(req.params.id, 10); // 댓글 ID
			const { password, content } = req.body; // 요청 본문에서 비밀번호와 수정할 내용 추출

			// 비밀번호와 내용이 모두 제공되었는지 확인
			if (!password || !content) {
					return res.status(400).json({ message: '잘못된 요청입니다. 비밀번호와 댓글 내용을 제공해야 합니다.' });
			}

			// 댓글 수정 서비스 호출
			const updatedComment = await commentService.updateComment(commentId, password, content);
			
			return res.status(200).json(updatedComment);

	} catch (error) {
			if (error.code === 404) {
					return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
			} else if (error.code === 403) {
					return res.status(403).json({ message: '비밀번호가 틀렸습니다.' });
			} else {
					return next(error);
			}
	}
});


commentController.delete('/comments/:id', async (req, res, next) => {//댓글 삭제
	try {
			const commentId = parseInt(req.params.id, 10);
			const password = req.body.password;

			if (!commentId || !password) {
					return res.status(400).json({ message: '잘못된 요청입니다.' });
			}

			const deletedComment= await commentService.deleteComment({ id: commentId }, password);

			return res.status(200).json({ message: '댓글 삭제 성공' });
	} catch (error) {
			if (error.code === 404) {
					res.status(404).json({ message: "존재하지 않습니다." });
			} else if (error === 403) {
					res.status(403).json({ message: "비밀번호가 틀렸습니다." });
			} else {
					return next(error);
			}
	}
});
commentController.get('/api/posts/{postId}/comments', async (req, res, next) => {//댓글 목록 조회
	try {
			const page = parseInt(req.query.page) || 1;
			const pageSize = parseInt(req.query.pageSize) || 5;
			const sortBy = req.query.sortBy || null;

			const name = req.query.keyword || null;

			const result = await groupService.getList(name, page, pageSize, sortBy);
			return res.json(result);

	} catch (error) {
			return next(error);
	}
});

commentController.get('/api/posts/{postId}/comments', async (req, res, next) => {
  const { postId } = req.params;

  try {
    
    const comments = await commentService.getCommentsByPostId(Number(postId));

    return res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (error) {

    console.error(error);
    return res.status(500).json({
      success: false,
      message: '댓글 목록을 조회하는 데 실패했습니다.',
    });
  }
});

export default commentController;