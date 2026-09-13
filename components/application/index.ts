/**
 * Application UI Kit Library - 共有 UI コンポーネントライブラリ
 *
 * shadcn/ui（Base UI ベース / gen3）を土台にした共有 UI コンポーネント群です。
 *
 * 名前は接頭辞なしで統一しています（`Button` / `DatePicker` …）。
 * 由来は名前ではなく、下の 2 つのセクションで表します。
 *
 *   1. このリポジトリが API を設計したもの。
 *      items 配列や columns/rows のような props API、非同期ダイアログ、
 *      日本語の既定ラベルなど、shadcn/ui にない value を持つものだけを置きます。
 *      仕様は Storybook を正とします。
 *
 *   2. shadcn/ui をそのまま re-export しているもの（Card / Spinner / Textarea 等）。
 *      ラップする理由がないため、素の shadcn/ui をそのまま公開しています。
 *      **こちらは https://ui.shadcn.com/docs/components がそのまま使えます。**
 *
 * どちらのセクションにあるかは実装の内部事情なので、必要になれば 2 から 1 へ
 * 移します。名前が由来を持たないため、その移動で利用側は壊れません。
 *
 * 各コンポーネントの仕様・使用例・使わない場面は Storybook を参照してください。
 *   bun run storybook
 *
 * <important>
 * このファイルが配布物のエントリです。ここに export を追加したら、
 * その .tsx と下請け（components/ui/*）が同じコミットに含まれていることを
 * 確認してください。`bun run build` が通らない export は publish できません。
 * </important>
 */

/* ==========================================================================
 * このリポジトリが API を設計したもの
 *
 * 仕様は Storybook を正とします。shadcn/ui のドキュメントとは props が違います。
 * ========================================================================== */

export { Button } from "./Button";
export type { ButtonProps, ButtonVariant } from "./Button";

export { Dialog } from "./Dialog";
export type { DialogProps } from "./Dialog";

export { ConfirmDialog } from "./ConfirmDialog";
export type { ConfirmDialogProps } from "./ConfirmDialog";

export { FormDialog } from "./FormDialog";
export type { FormDialogProps } from "./FormDialog";

export { toast, Toaster } from "./Toast";
export type { ToastOptions, ToastType } from "./Toast";

export { Dropdown } from "./Dropdown";
export type { DropdownProps, DropdownItem } from "./Dropdown";

export { DatePicker } from "./DatePicker";
export type {
  DatePickerProps,
  DatePickerMode,
  DatePickerValue,
} from "./DatePicker";

export { Input } from "./Input";
export type { InputProps } from "./Input";

export { Select } from "./Select";
export type { SelectProps, SelectItem } from "./Select";

export {
  Combobox,
  COMBOBOX_CREATE_PREFIX,
  splitCreatedValues,
} from "./Combobox";
export type { ComboboxProps, ComboboxItem } from "./Combobox";

export { TreeSelect, findTreePath } from "./TreeSelect";
export type {
  TreeSelectProps,
  TreeSelectItem,
} from "./TreeSelect";

export { Checkbox } from "./Checkbox";
export type { CheckboxProps } from "./Checkbox";

export { ButtonGroup } from "./ButtonGroup";
export type {
  ButtonGroupProps,
  ButtonGroupItem,
} from "./ButtonGroup";

export { Table } from "./Table";
export type { TableProps, TableColumn, TableSort, TableSelection, TableRowKey } from "./Table";

export { FormField } from "./FormField";
export type { FormFieldProps } from "./FormField";

/* 名前は `FieldSet` ではなく `FormFieldSet`。`FieldSet` は下の
 * 「shadcn/ui をそのまま公開しているもの」で primitive が持つ。理由は
 * FormFieldSet.tsx の冒頭コメントを参照。 */
export { FormFieldSet } from "./FormFieldSet";
export type { FormFieldSetProps } from "./FormFieldSet";

export { Tabs } from "./Tabs";
export type { TabsProps, TabItem } from "./Tabs";

export { Pagination } from "./Pagination";
export type { PaginationProps } from "./Pagination";

export { Badge } from "./Badge";
export type { BadgeProps, BadgeTone } from "./Badge";

export { RadioGroup } from "./RadioGroup";
export type {
  RadioGroupProps,
  RadioGroupItem,
  RadioGroupVariant,
} from "./RadioGroup";

export { RadioTable } from "./RadioTable";
export type { RadioTableProps } from "./RadioTable";

export { SearchInput } from "./SearchInput";
export type { SearchInputProps } from "./SearchInput";

export { ScopeSearch } from "./ScopeSearch";
export type {
  ScopeSearchProps,
  ScopeSearchItem,
} from "./ScopeSearch";

export { NavItem } from "./NavItem";
export type { NavItemProps, NavItemColor } from "./NavItem";

// framer-motion を使うのはこの 2 つだけ。NavItem から参照しないこと（decisions/adr-0008）。
export { AnimatedNavItem } from "./AnimatedNavItem";
export type { AnimatedNavItemProps } from "./AnimatedNavItem";

export { ActiveIndicator } from "./ActiveIndicator";
export type { ActiveIndicatorProps } from "./ActiveIndicator";

export { ThemeToggle } from "./ThemeToggle";
export type { ThemeToggleProps } from "./ThemeToggle";

export { CopyButton, copyTextToClipboard } from "./CopyButton";
export type { CopyButtonProps, CopyResult } from "./CopyButton";

export { Alert } from "./Alert";
export type { AlertProps, AlertTone, AlertVariant } from "./Alert";

export { Breadcrumbs } from "./Breadcrumbs";
export type { BreadcrumbsProps, BreadcrumbItem } from "./Breadcrumbs";

export { PageHeader } from "./PageHeader";
export type { PageHeaderProps } from "./PageHeader";

export { Stat } from "./Stat";
export type { StatProps, StatTone } from "./Stat";

export { FileDropZone } from "./FileDropZone";
export type { FileDropZoneProps } from "./FileDropZone";

export { Steps } from "./Steps";
export type { StepsProps, StepItem, StepStatus } from "./Steps";

export { DescriptionList } from "./DescriptionList";
export type { DescriptionListProps, DescriptionItem } from "./DescriptionList";

/* Textarea は shadcn/ui の re-export から移動した（error と文字数カウンタを持つため）。
 * 名前は変わらないので利用側の import はそのまま動く。 */
export { Textarea } from "./Textarea";
export type { TextareaProps } from "./Textarea";

/* ==========================================================================
 * shadcn/ui をそのまま公開しているもの
 *
 * ラップしても足せる value がないため、素の shadcn/ui を re-export します。
 * ここに並ぶものは https://ui.shadcn.com/docs/components と同じ API です。
 *
 * 独自の振る舞いが必要になったら、上のセクションへ移してください。
 * 名前は変わらないので、利用側の import はそのまま動きます。
 *
 * `FieldSet` は shadcn/ui の primitive のままです。ラベル・必須・エラー配置を
 * 引き受ける props API 版は上のセクションで `FormFieldSet` として公開しています。
 * ========================================================================== */

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "../ui/card";
export { Spinner } from "../ui/spinner";
export { Switch } from "../ui/switch";
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
export {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "../ui/popover";
export { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from "../ui/avatar";
export {
  Progress,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue,
} from "../ui/progress";
export {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from "../ui/empty";
export {
  Item,
  ItemGroup,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
  ItemHeader,
  ItemFooter,
  ItemSeparator,
} from "../ui/item";
export {
  Field,
  FieldSet,
  FieldLegend,
  FieldGroup,
  FieldLabel,
  FieldTitle,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldSeparator,
} from "../ui/field";
export { Label } from "../ui/label";
export { Separator } from "../ui/separator";
export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../ui/accordion";
export { Collapsible, CollapsibleTrigger, CollapsibleContent } from "../ui/collapsible";

/* ==========================================================================
 * 旧名（Application* 接頭辞つき）の後方互換エイリアス
 *
 * v7.0.0 を非破壊にするためだけに残しています。**v8.0.0 で削除します。**
 * 新しい export はここではなく上のセクションへ接頭辞なしで追加してください。
 * ========================================================================== */

export * from "./legacy-names";
