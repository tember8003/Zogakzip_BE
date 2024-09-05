import express from 'express';
import groupService from '../services/groupService.js';
import postService from '../services/postService.js';
import badgeRepository from '../repositories/badgeRepository.js';
import { is } from 'superstruct';
<<<<<<< HEAD
<<<<<<< HEAD
=======
=======
>>>>>>> 435913b (Fix : merge 해결)
import multer from 'multer';

const upload = multer({ dest: 'uploads/' }); // 파일을 임시로 저장할 경로 설정
<<<<<<< HEAD
>>>>>>> dce4a09 (Test:form-data 형식을 json으로 바꾸기)
=======
>>>>>>> 435913b (Fix : merge 해결)

const groupController = express.Router();


groupController.post('/', upload.single('image'),async (req, res, next) => {//그룹 등록
    try {
        console.log("그룹 생성 들어옴");
<<<<<<< HEAD
<<<<<<< HEAD
        const { name, password, isPublic, introduction, imageUrl } = req.body;
=======
        const { name, password, isPublic, introduction } = req.body;
        const imageUrl = req.file ? req.file.path : null;  // 이미지 파일 경로 설정
        
>>>>>>> dce4a09 (Test:form-data 형식을 json으로 바꾸기)
=======
        const { name, password, isPublic, introduction } = req.body;
        const imageUrl = req.file ? req.file.path : null;  // 이미지 파일 경로 설정
        //const { name, password, isPublic, introduction, imageUrl } = req.body;
        
>>>>>>> 435913b (Fix : merge 해결)
        console.log(name, password, imageUrl, isPublic, introduction);

        if (!password) {
            return res.status(404).json({ message: '잘못된 요청입니다. - 비밀번호는 필수사항입니다.' });
        }
        if (!name) {
            return res.status(404).json({ message: '잘못된 요청입니다. - 이름은 필수사항입니다.' });
        }

        const groupData = {
            name,
            password,
            isPublic: Boolean(isPublic),
            introduction,
            imageUrl,
        }

        const group = await groupService.createGroup(groupData);
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

        //배지 목록 업데이트하기
        await badgeRepository.getBadges(groupId);

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

groupController.post('/:id/posts', async (req, res, next) => { //게시글 등록
    try {
        const { nickname, title, content, imageUrl, location, moment, isPublic, } = req.body;
        //나중에 tag도 추가

        const password = req.body.password;
        const groupId = parseInt(req.params.id, 10);

        // 필수 입력값 확인
        if (!nickname || !title || !password || !content) {
            return res.status(400).json({ message: '잘못된 요청입니다. - 닉네임, 제목, 비밀번호는 필수사항입니다.' });
        }

        // 입력 데이터 정리
        const postData = {
            nickname,
            title,
            imageUrl,
            content,
            //tags: tags || [], // 기본값으로 빈 배열
            location,
            moment: new Date(moment),
            isPublic: Boolean(isPublic),
            password: password,
        };

        // 추억 등록 서비스 호출
        const post = await postService.createPost(postData, groupId);
        return res.status(201).json(post);
    } catch (error) {
        if (error.code === 404) {
            return res.status(404).json({ message: '잘못된 요청입니다.' });
        } else {
            return next(error);
        }
    }
})

groupController.get('/:id/posts', async (req, res, next) => { // 게시글 목록 조회
    try {
        const page = parseInt(req.query.page, 10) || 1; // 페이지 번호
        const pageSize = parseInt(req.query.pageSize, 10) || 5; // 페이지당 항목 수
        const sortBy = req.query.sortBy || 'latest'; // 정렬 기준 (기본값: 최신순)

        const groupId = parseInt(req.params.id, 10);

        let isPublic = true; // 공개 비공개 확인용
        if (req.query.isPublic !== undefined) {
            isPublic = req.query.isPublic === 'true'; // 쿼리 파라미터에 따라 공개/비공개 설정
        }

        const name = req.query.keyword || null; // 검색 키워드 (제목, 태그)

        // 게시글 목록 조회 서비스 호출
        const result = await postService.getPosts(
            name,
            page,
            pageSize,
            sortBy,
            isPublic,
            groupId
        );

        return res.status(200).json(result);

    } catch (error) {
        return next(error);
    }
});

export default groupController;