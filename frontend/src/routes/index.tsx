import { createFileRoute } from '@tanstack/react-router';
import { Link } from '@tanstack/react-router'; // 引入 Link 组件

export const Route = createFileRoute('/')({
  component: App,
});

export default function App() {
  return (
    <>
      <h1>INDEX</h1>
      <Link to="/theme">切换主题</Link> {/* 添加导航链接 */}
    </>
  );
}
