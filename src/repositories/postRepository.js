import prisma from "../config/prisma.js";
import bcrypt from 'bcrypt';

//게시글 등록(닉네임, 제목, 이미지<한장>,본문,태그, 장소, 추억의 순간, 추억공개여부, 비밀번호 입력)
async function createPost(post, groupId) {
	//비밀번호 해싱 작업
	const hashedPassword = await bcrypt.hash(post.password, 10);

	// 요청에 보낼 데이터
	return prisma.post.create({
		data: {
			nickname: post.nickname,
			title: post.title,
			imageUrl: post.imageUrl,
			content: post.content,
			likeCount: 0,
			commentCount: 0,
			/*
			tag: {
				set: post.tag,
			},
			*/
			location: post.location,
			moment: post.moment,
			isPublic: post.isPublic,
			password: hashedPassword,
			groupId: groupId,
		},
	});
}

async function findById(postId) {
	return prisma.post.findUnique({
		where: {
			id: postId,
		},
	});
}

//게시글 수정(비밀번호 입력하여 추억 수정)
async function updatePost(post) {
	const existingPost = await findById(post.id);

	// 게시글 업데이트
	return prisma.post.update({
		where: {
			id: post.id,
		},
		data: {
			nickname: post.nickname || existingPost.nickname,
			content: post.content || existingPost.content,
			title: post.title || existingPost.title,
			imageUrl: post.imageUrl || existingPost.imageUrl,
			//tags: post.tags ?? existingPost.tags,
			location: post.location || existingPost.location,
			isPublic: post.isPublic !== undefined ? post.isPublic : existingPost.isPublic,
		},
	});
}


// 게시글 삭제를 위한 함수
async function deletePostById(postId) {
	const deletedPost = await prisma.post.delete({
		where: {
			id: postId,
		},
	});

	return deletedPost;
}


//////////////////////////////////////////////////////////게시글 상세 (정보)조회
// 게시글 상세 조회
async function getDetail(postId) {
	return prisma.post.findUnique({
		where: {
			id: postId,
		},
		select: {
			id: true,
			groupId: true,
			nickname: true,
			title: true,
			imageUrl: true,
			content: true,
			//tags: true,
			location: true,
			moment: true,
			isPublic: true,
			likeCount: true,
			commentCount: true,
			createdAt: true,
		},
	});
}

//댓글 목록 조회용
async function getComments(skip, take, postId) {
	const comments = await prisma.comment.findMany({
		where: {
			postId: postId,  // postId를 기준으로 댓글 필터링
		},
		skip: skip,  // 페이지 시작 번호
		take: take,  // 페이지 크기
		select: {  // 필요한 필드 선택
			id: true,
			nickname: true,
			content: true,
			createdAt: true,
		},
	});
	return comments;
}

//댓글 개수 세기
async function countComments(postId) {
	const commentCount = await prisma.comment.count({
		where: {
			postId: postId,  // postId를 기준으로 필터링
		},
	});
	return commentCount;
}

// 공감 보내기
async function addLikeToPost(postId) {
	return prisma.post.update({
		where: {
			id: postId,
		},
		data: {
			likeCount: {
				increment: 1,
			},
		},
	});
}

<<<<<<< HEAD
=======
	// 기본 조건: 그룹 ID와 공개 여부에 따라 필터링
	let whereCondition = {
		groupId: groupId,
		isPublic: isPublic,
	};

	// 검색 조건 추가: 제목 또는 태그로 검색
	if (searchQuery) {
		whereCondition = {
			...whereCondition,
			OR: [
				{ title: { contains: searchQuery } },
				{ tags: { contains: searchQuery } },
			],
		};
	}

	// 게시글 조회
	const post = await prisma.post.findMany({
		where: whereCondition,
		orderBy: orderByCondition,
		select: {
			nickname: true,
			isPublic: true,
			title: true,
			imageUrl: true,
			tags: true,
			place: true,
			moment: true,
			likeCount: true,
			commentCount: true,
		},
	});

	return post;
}

>>>>>>> dce4a09 (Test:form-data 형식을 json으로 바꾸기)
//게시글 공감하기
// 게시글에 좋아요를 눌렀는지 확인하는 함수
async function likePost(postId, userId) {
	// 요청에 보낼 데이터
	const data = {
		userId: userId  // 좋아요를 누른 사용자 ID
	};

	try {
		// fetch를 사용하여 POST 요청 보내기
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				// 인증 토큰이 필요한 경우 아래 줄을 추가
				// 'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
			},
			body: JSON.stringify(data)
		});

		// 응답 처리
		if (response.ok) {
			const result = await response.json();
			if (result.success) {
				console.log("게시글에 좋아요가 성공적으로 추가되었습니다.", result);
				return result;
			} else {
				console.error("게시글에 좋아요 추가에 실패했습니다.", result);
				return result;
			}
		} else {
			console.error(`게시글에 좋아요 추가에 실패했습니다. 상태 코드: ${response.status}`);
		}
	} catch (error) {
		console.error("네트워크 오류:", error);
	}
}


//게시글 공개 여부 확인
async function checkPostPublicStatus(postId) {
	const foundPost = await prisma.post.findUnique({
		where: {
			id: postId,
		},
		select: {
			id: true,
			isPublic: true,
		},
	});
	return foundPost;
<<<<<<< HEAD
}

//댓글 달면 commentCount +1
async function plusComment(post) {
	const foundPost = await prisma.post.update({
		where: {
			id: post.id,
		},
		data: {
			commentCount: post.commentCount + 1,
		},
	});
	return foundPost;
=======
>>>>>>> dce4a09 (Test:form-data 형식을 json으로 바꾸기)
}

export default {
	createPost,
	updatePost,
	findById,
	deletePostById,
	getDetail,
	addLikeToPost,
	likePost,
	checkPostPublicStatus,
	plusComment,
	countComments,
	getComments,
}