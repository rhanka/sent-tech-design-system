import { h, defineComponent } from 'vue';
import type { DataTableColumn, DataTableProps, MenuActionItem, MessageAction, AlertProps, ToastProps, ToastItem, TreeNode, AccordionItem, WebFrameConfig } from '../../dist/index.js';
import type { ChatMessageProps, ChatThreadProps, EmptyStateProps, FooterProps, MessageStatusBadgeProps, OrderedListInput, UnorderedListInput, QuoteProps, StreamingMessageProps, StructuredListItem } from '../../dist/index.js';
import type { MenuLabelProps } from '../../dist/MenuLabel.vue.js';
const vnode = h('b', 'Rich');
// Rich content must use the documented slots: it may not compile then disappear.
// @ts-expect-error use column-label
const column: DataTableColumn = { key: 'name', label: vnode };
// @ts-expect-error use cell
const cell: DataTableColumn = { key: 'name', cell: () => vnode };
// @ts-expect-error use caption
const table: DataTableProps = { columns: [], rows: [], caption: vnode };
// @ts-expect-error use item-icon
const menu: MenuActionItem = { label: 'Rich', icon: defineComponent({}) };
// @ts-expect-error use action-icon
const action: MessageAction = { label: 'Rich', icon: vnode };
// @ts-expect-error use title
const alert: AlertProps = { title: vnode };
// @ts-expect-error use message
const toast: ToastProps = { message: vnode };
// @ts-expect-error use actions
const item: ToastItem = { id: 'one', actions: vnode };
// @ts-expect-error use node-label
const node: TreeNode = { id: 'one', label: vnode };
// @ts-expect-error use item-content
const accordion: AccordionItem = { id: 'one', title: 'Rich', content: () => vnode };
const frame: WebFrameConfig = { src: 'https://example.com', sandbox: ['allow-scripts'] };
void [column, cell, table, menu, action, alert, toast, item, node, accordion, frame];
// Scalar fallbacks and their aliases must consistently reject rich values.
// @ts-expect-error use timestamp
const timestamp: ChatMessageProps['timestamp'] = vnode;
// @ts-expect-error use footer
const footer: ChatMessageProps['footer'] = vnode;
// @ts-expect-error use avatar
const avatar: ChatMessageProps['avatar'] = vnode;
// @ts-expect-error use empty
const empty: ChatThreadProps['emptyLabel'] = vnode;
// @ts-expect-error use action
const emptyAction: EmptyStateProps['action'] = vnode;
// @ts-expect-error use copyright
const copyright: FooterProps['copyright'] = vnode;
// @ts-expect-error use label
const menuLabel: MenuLabelProps['label'] = vnode;
// @ts-expect-error use label
const statusLabel: MessageStatusBadgeProps['labels'] = { sent: vnode };
// @ts-expect-error use item
const ordered: OrderedListInput = vnode;
// @ts-expect-error use item
const unordered: UnorderedListInput = vnode;
// @ts-expect-error use author
const author: QuoteProps['author'] = vnode;
// @ts-expect-error use source
const source: QuoteProps['source'] = vnode;
// @ts-expect-error use text
const stream: StreamingMessageProps['text'] = vnode;
// @ts-expect-error use placeholder
const placeholder: StreamingMessageProps['placeholder'] = vnode;
// @ts-expect-error use definition
const definition: StructuredListItem['value'] = vnode;
void [timestamp, footer, avatar, empty, emptyAction, copyright, menuLabel, statusLabel, ordered, unordered, author, source, stream, placeholder, definition];
