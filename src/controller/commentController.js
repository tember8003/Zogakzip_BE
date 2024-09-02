import express from 'express';
import commentService from '../services/groupService.js';
import badgeRepository from '../repositories/badgeRepository.js';

const commentController = express.Router();


commentController.post('/', async (req, res, next) => {//댓글 등록
    try {
        const {nickname, password, content } = req.body;

        if (!nickname || !password) {
            return res.status(404).json({ message: '잘못된 요청입니다. - 이름과 비밀번호는 필수사항입니다.' });
        }

        const commentData = {
            nickname,
            password,
            content,
        }

        const group = await groupService.createGroup(commentData);
        return res.status(201).json(group);
    } catch (error) {
        if (error.code === 422) {
            res.status(422).json({ message: "댓글 등록 중 오류 발생" })
        } else {
            return next(error);
        }
    }
});

commentController.get('/:memoryId', async (req, res, next) => {
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


commentController.put('/:id', async (req, res, next) => {
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


commentController.delete('/:id', async (req, res, next) => {//댓글 삭제
	try {
			const groupId = parseInt(req.params.id, 10);
			const password = req.body.password;

			if (!groupId || !password) {
					return res.status(400).json({ message: '잘못된 요청입니다.' });
			}

			const deletedGroup = await groupService.deleteGroup({ id: groupId }, password);

			return res.status(200).json({ message: '그룹 삭제 성공' });
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


export default commentController;