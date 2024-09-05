import commentRepository from "../repositories/commentRepository.js";
import postRepository from "../repositories/postRepository.js";
import bcrypt from 'bcrypt';

async function addComment(commentId, nickname, content, password){
  const comment = await this.commentRepository.getCommentById(commentId);
  if (!comment) throw new Error('Post ');
    
  post.comments.push({ nickname, content, password, createdDt: new Date().toISOString() });
    
  await this.postRepository.updatePost(post);
  return post;
  };

async function updateComment(postId, idx, newContent, password) {
			const post = await this.postRepository.getPostById(postId);
			if (!post) {
				throw new Error('Post not found');
			}
			const comment = post.comments.find((comment) => comment.idx === idx);
			if (!comment) {
				throw new Error('Comment not found');
			}
	
			if (comment.password !== password) {
				throw new Error('Incorrect password');
			}
	
			comment.content = newContent;
			comment.updatedDt = new Date().toISOString();
	
			await this.postRepository.updatePost(post);
			
			return post;
		}

async function deleteComment(postId, idx, password) {
				const post = await this.postRepository.getPostById(postId);
				if (!post) {
					throw new Error('Post not found'); // 게시물이 없을 때 에러 반환
				}
	
				const comment = post.comments.find((comment) => comment.idx === idx);
				if (!comment) {
					throw new Error('Comment not found'); // 댓글이 없으면 에러 반환
				}
		
				if (comment.password !== password) {
					throw new Error('Incorrect password'); // 비밀번호가 일치하지 않으면 에러 반환
				}
		
				post.comments = post.comments.filter((comment) => comment.idx !== idx);
		
				await this.postRepository.updatePost(post);
				
				return post;
			}
		
async function getCommentsByPostId(postId) {
	return prisma.comment.findMany({
		where: { postId },
		orderBy: { createdAt: 'desc' }, 
		select: {
		nickname: true,
		content: true,
		createdAt: true,
		},
	});
}
			
			export default {
				addComment,
				updateComment,
				deleteComment,
				getCommentsByPostId

		}