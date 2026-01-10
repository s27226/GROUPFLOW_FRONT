import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "../../../components/layout";
import { Post } from "../../../components/feed";
import SkeletonPost from "../../../components/ui/SkeletonPost";
import { ArrowLeft } from "lucide-react";
import { usePost } from "../../../hooks";
import styles from "./PostPage.module.css";

export default function PostPage() {
    const { postId } = useParams();
    const navigate = useNavigate();
    const { post, loading, error } = usePost(postId);

    return (
        <Layout variant="compact" showTrending={false}>
            <div className={styles.postpageWrapper}>
                <button className={styles.postpageBackBtn} onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                    <span>Back</span>
                </button>

                <div className={styles.postpageCard}>
                    {loading ? (
                        <SkeletonPost count={1} />
                    ) : error ? (
                        <p className={styles.errorMessage}>{error}</p>
                    ) : (
                        <Post {...post} isFullView={true} />
                    )}
                </div>
            </div>
        </Layout>
    );
}
