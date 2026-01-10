import { Layout } from "../../../components/layout";
import { CreateGroup } from "../../../components/projects";

export default function CreateGroupPage() {
    return (
        <Layout variant="compact" showTrending={false}>
            <CreateGroup />
        </Layout>
    );
}
