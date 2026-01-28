import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Layout } from "../../../components/layout";
import { Post } from "../../../components/feed";
import SkeletonPost from "../../../components/ui/SkeletonPost";
import { ArrowLeft } from "lucide-react";
import { usePost } from "../../../hooks";
import { translateError } from "../../../utils/errorTranslation";
import styles from "./PostPage.module.css";

export default function PostPage() {
    const { t } = useTranslation();
    const { postId } = useParams();
    const navigate = useNavigate();
    const { post, loading, error } = usePost(postId ?? "");

    return (
        <Layout variant="compact" showTrending={false}>
            <div className={styles.postpageWrapper}>
                <button className={styles.postpageBackBtn} onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                    <span>{t('common.back')}</span>
                </button>

                <div className={styles.postpageCard}>
                    {loading ? (
                        <SkeletonPost count={1} />
                    ) : error ? (
                        <p className={styles.errorMessage}>{translateError(error, 'common.errorOccurred')}</p>
                    ) : post ? (
                        <Post
                            id={post.id}
                            author={post.author}
                            authorId={post.authorId ?? 0}
                            authorProfilePic={post.authorProfilePic}
                            time={post.time ?? ''}
                            content={post.content ?? ''}
                            image={post.image}
                            comments={(post.comments ?? []).map((c) => ({
                                id: c.id,
                                user: c.user,
                                userId: c.userId,
                                profilePic: c.profilePic,
                                time: c.time,
                                text: c.text,
                                likes: c.likes ?? [],
                                liked: c.liked,
                                menuOpen: c.menuOpen,
                                replies: (c.replies ?? []).map((r) => ({
                                    id: r.id,
                                    user: r.user,
                                    userId: r.userId,
                                    profilePic: r.profilePic,
                                    time: r.time,
                                    text: r.text,
                                    likes: r.likes ?? [],
                                    liked: r.liked,
                                    menuOpen: r.menuOpen,
                                    replies: []
                                }))
                            }))}
                            likes={post.likes ?? []}
                            saved={post.saved}
                            hidden={post.hidden}
                            sharedPost={post.sharedPost ? {
                                id: post.sharedPost.id,
                                author: post.sharedPost.author,
                                authorId: post.sharedPost.authorId,
                                authorProfilePic: post.sharedPost.authorProfilePic,
                                time: post.sharedPost.time,
                                content: post.sharedPost.content ?? '',
                                image: post.sharedPost.image
                            } : null}
                            isFullView={true}
                        />
                    ) : null}
                </div>
            </div>
        </Layout>
    );
}
