import prisma from "../config/prisma.js";

//비밀번호 일치 여부 확인
async function checkPassword(commentid, commentPassword) {
	return prisma.comment.findFirst({
			where: {
					id: commentid,
					password: commentPassword,
			},
	});
}

//댓글 수정
async function updateGroup(comment) {
	const existingComment = await findById(comment.id);

	return prisma.comment.update({
			where: {
					id: comment.id
			},
			data: {
					name: comment.nickname|| existingComment,nickname,
					content: comment.content|| existingComment.content,
			},
	});
}


//댓글 생성하기
async function save(comment) {
	//비밀번호 해싱 작업
	const hashedPassword = await bcrypt.hash(comment.password, 10);

	return prisma.comment.create({
			data: {
					nickname: comment.nicknamename,
					password: hashedPassword,
					content: comment.content,
			},
	});
}
// 댓글 상세 목록 조회용 (id로 검사)
async function getDetail(commentId) {
  return prisma.comment.findUnique({
    where: {
      id: commentId, 
    },
    select: {
      nickname: true,    
      createdAt: true,   
      password: false,   
      content: true,     
    },
  });
}



//id를 통해 그룹 삭제하기
async function deleteCommentById(comment) {
	const deletedComment = await prisma.comment.delete({
			where: {
					id: comment.id,
			},
	});
	return deletedComment;}


export default {
	save,
	updateGroup,
	deleteCommentById,
	checkPassword,
	getDetail
}