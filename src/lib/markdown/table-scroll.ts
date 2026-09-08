import type { SatteriProcessorOptions } from '@astrojs/markdown-satteri';

/** Preserve full-width native table layout, with a keyboard-scrollable container. */
const tableScroll = {
  name: 'table-scroll',
  element: {
    filter: ['table'],
    visit(node, ctx) {
      const parent = ctx.parent(node);
      const classes = parent?.type === 'element' ? parent.properties.className : undefined;
      if (Array.isArray(classes) && classes.includes('table-scroll')) return;
      ctx.wrapNode(node, {
        type: 'element',
        tagName: 'div',
        properties: { className: ['table-scroll'], tabIndex: 0, role: 'region', ariaLabel: 'Table' },
        children: [],
      });
    },
  },
} satisfies NonNullable<SatteriProcessorOptions['hastPlugins']>[number];

export default tableScroll;
