import { Link } from 'react-router';
import type { TreeNode } from '~/utils/gather-docs.server';

export function RenderList({ nodes }: { nodes: TreeNode[] }) {
  return (
    <ul className="govuk-list govuk-list--bullet govuk-!-margin-bottom-0">
      {nodes.map((node, index) => (
        <li key={index}>
          <Link to={`#${node.text.replaceAll('.', '').replaceAll(' ', '-').toLowerCase()}`}>
            {node.text}
          </Link>
          {node.children.length > 0 && node.depth < 3 && <RenderList nodes={node.children} />}
        </li>
      ))}
    </ul>
  );
}
