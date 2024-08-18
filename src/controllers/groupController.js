import express from 'express';
import groupService from '../services/groupService.js';

const groupController = express.Router();

export default groupController;

groupController.post('/', async (req, res, next) => {//그룹 등록
    try {
        const name = req.body.name;
        const password = req.body.password;

        if (!name || !password) {
            return res.status(404).json({ message: '잘못된 요청입니다.' });
        }

        const group = await groupService.createGroup(req.body);
        return res.status(201).json(group);
    } catch (error) {
        if (error.code === 422) {
            res.status(422).json({ message: "동일한 이름의 그룹이 이미 존재합니다." })
        } else {
            return next(error);
        }
    }
});

groupController.get('/', async (req, res, next) => {//그룹 목록 조회
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 5;
        const sortBy = req.query.sortBy || null;

        let isPublic = true; //공개 비공개 확인용
        //공개 비공개가 주어지지 않았다면 기본값으로 true
        if (req.query.isPublic !== undefined) {
            isPublic = req.query.isPublic === 'true';
        }
        const name = req.query.keyword || null;

        const result = await groupService.getList(name, page, pageSize, sortBy, isPublic);
        return res.json(result);

    } catch (error) {
        return next(error);
    }
});

groupController.put('/:id', async (req, res, next) => {//그룹 수정
    try {
        const groupId = parseInt(req.params.id, 10);
        const inputPassword = req.body.password;
        if (!inputPassword) {
            return res.status(404).json({ message: '잘못된 요청입니다.' });
        }


        const groupData = { ...req.body, id: groupId };

        const group = await groupService.updateGroup(groupData);
        return res.status(201).json(group);
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

groupController.delete('/:id', async (req, res, next) => {//그룹 삭제
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

groupController.get('/:id', async (req, res, next) => { //그룹 상세 정보 조회
    try {
        const groupId = parseInt(req.params.id, 10);
        const group = await groupService.getDetail(groupId);
        return res.status(200).json(group);
    } catch (error) {
        if (error.code === 404) {
            res.status(404).json({ message: "존재하지 않습니다." });
        } else {
            return next(error);
        }
    }
});

//!--주의--! 메시지는 나오도록 설정됐지만, 다른 기능은 없음. -> 잘 구현됐는지 미지수
groupController.post('/:id/verify-password', async (req, res, next) => { //그룹 조회 권한 확인 
    try {
        const groupId = parseInt(req.params.id, 10);
        const password = req.body.password; // 요청 본문에서 비밀번호 추출

        if (!password) {
            return res.status(400).json({ message: '잘못된 요청입니다.' });
        }
        // 서비스 호출하여 비밀번호 확인
        const { message } = await groupService.verifyPassword(groupId, password);

        res.status(200).json({ message });
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
});

groupController.post('/:id/like', async (req, res, next) => { //그룹 공감하기
    try {
        const groupId = parseInt(req.params.id, 10);

        const result = await groupService.pushLike(groupId);
        if (result) {
            res.json({ message: "그룹 공감하기 성공" });
        }
    } catch (error) {
        if (error.code === 404) {
            res.status(404).json({ message: "존재하지 않습니다." });
        } else {
            return next(error);
        }
    }
})

groupController.get('/:id/is-public', async (req, res, next) => {//그룹 공개 여부 확인하기
    try {
        const groupId = parseInt(req.params.id, 10);

        const group = await groupService.getPublic(groupId);
        return res.status(200).json(group);
    } catch (error) {
        if (error.code === 404) {
            res.status(404).json({ message: "존재하지 않습니다." });
        } else {
            return next(error);
        }
    }
})