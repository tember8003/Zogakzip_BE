import prisma from "../config/prisma.js";;
import bcrypt from 'bcrypt'

/////////////////////////////////////게시글 등록(닉네임, 제목, 이미지<한장>,본문,태그, 장소, 추억의 순간, 추억공개여부, 비밀번호 입력)
async function createPost(post) {
  // 요청에 보낼 데이터
  return prisma.post.create({
		data:{
			nickname: post.nickname,
			title: title,
			imageUrl: post.imageUrl,
			content:post.content,
			tags:post.tags,
			place:post.place,
			isPublic:post.isPublic,
			password:hashedPassword,
		},
	});
}
///////////////////////////게시글 수정(비밀번호 입력하여 추억 수정)
async function updatePost(post) {
	// 게시글을 ID로 찾음
	const existingPost = await prisma.post.findUnique({
			where: {
					id: post.id,
			},
	});

	// 게시글이 존재하지 않을 경우 에러 발생
	if (!existingPost) {
			throw new Error("해당 게시글을 찾을 수 없습니다.");
	}

	// 비밀번호 검증
	if (existingPost.password !== post.password) {
			throw new Error("비밀번호가 일치하지 않습니다.");
	}

	// 게시글 업데이트
	return prisma.post.update({
			where: {
					id: post.id,
			},
			data: {
					content: post.content ?? existingPost.content,
					title: post.title ?? existingPost.title,
					imageUrl: post.imageUrl ?? existingPost.imageUrl,
					tags: post.tags ?? existingPost.tags,
					place: post.place ?? existingPost.place,
					isPublic: post.isPublic !== undefined ? post.isPublic : existingPost.isPublic,
			},
	});
}


//////////////////////////////게시글 삭제(비밀번호 입력하여 추억 삭제)
// 게시글 삭제를 위한 함수
async function deletePostById(post) {
	const existingPost = await prisma.post.delete({
			where: {
					id: post.id,
			},
	});

	return deletePost;
}

//////////////////////////////게시글 목록 조회()
// 게시글 목록 조회를 위한 함수
async function getPosts(groupId) {

	try {
			// GET 요청 보내기
			const response = await fetch(url, {
					method: 'GET',
					headers: {
							'Content-Type': 'application/json',
							// 인증 토큰이 필요한 경우 아래 줄을 추가
							// 'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
					}
			});

			// 응답 처리
			if (response.ok) {
					const posts = await response.json();
					console.log("게시글 목록을 성공적으로 조회했습니다.", posts);
					return posts;
			} else {
					console.error(`게시글 목록 조회에 실패했습니다. 상태 코드: ${response.status}`);
			}
	} catch (error) {
			console.error("네트워크 오류:", error);
	}
}

//////////////////////////////////////////////////////////게시글 상세 (정보)조회
// 게시글 상세 조회
async function getPostDetails(postId) {
	return prisma.post.findUnique({
			where: {
					id: postId,
			},
			include: {
					comments: true,  // 댓글 목록 포함
			},
			select: {
					nickname: true,
					title: true,
					imageUrl: true,
					content: true,
					tags: true,
					place: true,
					moment: true,
					isPublic: true,
					likeCount: true,
					commentCount: true,
			},
	});
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
//////////////////////////////////////////////////////////게시글 조회 권한 확인
async function getGroupPosts(groupId, filterOptions) {
	const { isPublic, sortBy, searchQuery } = filterOptions;

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

	// 정렬 조건
	let orderByCondition;
	if (sortBy === 'latest') {
			orderByCondition = { createdAt: 'desc' };
	} else if (sortBy === 'comments') {
			orderByCondition = { commentCount: 'desc' };
	} else if (sortBy === 'likes') {
			orderByCondition = { likeCount: 'desc' };
	} else {
			orderByCondition = { createdAt: 'desc' }; // 기본 정렬: 최신순
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

//////////////////////////////////////////////////////////게시글 공감하기
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


///////////////////////////////////////////////////////////게시글 공개 여부 확인
async function checkPostPublicStatus(postId) {

	try {
			// fetch를 사용하여 GET 요청 보내기
			const response = await fetch(url, {
					method: 'GET',
					headers: {
							'Content-Type': 'application/json',
							// 인증 토큰이 필요한 경우 아래 줄을 추가
							// 'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
					}
			});

			// 응답 처리
			if (response.ok) {
					const result = await response.json();
					console.log("게시글 공개 여부를 성공적으로 확인했습니다.", result);
					return result.isPublic; // `isPublic`이 true면 공개, false면 비공개
			} else {
					console.error(`게시글 공개 여부 확인에 실패했습니다. 상태 코드: ${response.status}`);
					return null;
			}
	} catch (error) {
			console.error("네트워크 오류:", error);
			return null;
	}
}

export default {
	createPost,
	updatePost,
	deletePostById,
	getPosts,
	getPostDetails,
	addLikeToPost,
	getGroupPosts,
	likePost,
	checkPostPublicStatus,
}