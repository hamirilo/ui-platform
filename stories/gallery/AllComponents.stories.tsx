import type { Meta, StoryObj } from "@storybook/react-vite";
import { Calendar, FileText, MoreVertical, Plus, Search } from "lucide-react";
import * as React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Alert,
  Avatar,
  AvatarFallback,
  Badge,
  Breadcrumbs,
  Button,
  DescriptionList,
  ButtonGroup,
  Checkbox,
  Combobox,
  ConfirmDialog,
  DatePicker,
  Dialog,
  Dropdown,
  FileDropZone,
  FormDialog,
  FormField,
  Input,
  NavItem,
  PageHeader,
  PageSection,
  Pagination,
  RadioGroup,
  SearchInput,
  Select,
  Table,
  type TableColumn,
  Tabs,
  ThemeToggle,
  toast,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
  Label,
  Progress,
  ProgressIndicator,
  ProgressTrack,
  Separator,
  Spinner,
  Stat,
  Steps,
  Switch,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/application";
import { Cluster, Grid, Labeled, Section, Showcase, Stack } from "../_showcase";

/**
 * UI Kit 全体を 1 画面で俯瞰するためのページ。
 *
 * <important>
 * ここは「何が使えるか」を探すための入口。**網羅はしない。**
 * 状態や Props の全パターンは各コンポーネントの Overview / 個別 Story にある。
 * 新しいコンポーネントを追加したら、代表的な見た目を 1 つだけここに足す。
 * </important>
 */
const meta = {
  title: "ギャラリー/全コンポーネント",
  parameters: {
    layout: "padded",
    // 一覧のため Props を 1 つ変えても全体に効かない。Controls は出さない。
    controls: { disable: true },
    docs: {
      description: {
        component: `
## 目的

**使える UI を短時間で探せる**ようにする。コードを読まずに、
どのコンポーネントがあるかを 1 画面で把握するためのページ。

## 見方

1. ここで使えそうなコンポーネントを見つける
2. サイドバーの \`Components/<名前>\` の **Overview** でバリエーションと状態を比較する
3. 個別 Story で操作・キーボード・エラー時の見た目を確かめる

各見本の上に付いている名前が、そのまま公開 API の名前です。

\`\`\`tsx
import { Button } from 'application-ui-kit'
\`\`\`

## ここに載せないもの

- 状態や Props の全パターン（各 Overview にある）
- 複数コンポーネントを組み合わせた画面（\`Patterns\` にある）
- 色・文字・余白のトークン（\`Foundations\` にある）
        `,
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type Request = { id: number; code: string; title: string; status: "new" | "active" | "done" };

const STATUS_LABEL: Record<Request["status"], string> = {
  new: "未対応",
  active: "対応中",
  done: "完了",
};

const ROWS: Request[] = [
  { id: 1, code: "SYS-2026-0001", title: "備品購入（モニター 2 台）", status: "new" },
  { id: 2, code: "SYS-2026-0002", title: "出張費精算（大阪）", status: "active" },
  { id: 3, code: "SYS-2026-0003", title: "書籍購入", status: "done" },
];

const COLUMNS: TableColumn<Request>[] = [
  { key: "code", header: "申請番号", className: "w-36", cell: (r) => r.code },
  { key: "title", header: "件名", cell: (r) => r.title },
  {
    key: "status",
    header: "ステータス",
    className: "w-24",
    cell: (r) => <Badge tone={r.status}>{STATUS_LABEL[r.status]}</Badge>,
  },
];

const PRIORITIES = [
  { value: "high", label: "高" },
  { value: "mid", label: "中" },
  { value: "low", label: "低" },
];

const SHOPS = [
  { value: "1001", label: "本店", badge: "1001" },
  { value: "1002", label: "北営業所", badge: "1002" },
  { value: "1003", label: "南営業所", badge: "1003" },
];

/**
 * UI Kit の全体像。
 *
 * 役割ごとにまとめてある。各見本のラベルが公開 API の名前。
 */
export const AllComponents: Story = {
  render: () => {
    const [dialog, setDialog] = React.useState<"dialog" | "confirm" | "form" | null>(null);
    const [page, setPage] = React.useState(2);

    return (
      <Showcase className="max-w-none">
        <Section
          title="Actions"
          note="操作の意味は色で表す。削除は danger、キャンセルは secondary。primary は 1 画面に 1 つ。"
        >
          <Grid className="sm:grid-cols-3">
            <Labeled label="Button">
              <Cluster>
                <Button>保存</Button>
                <Button variant="secondary">キャンセル</Button>
                <Button variant="danger">削除</Button>
              </Cluster>
            </Labeled>
            <Labeled label="ButtonGroup">
              <ButtonGroup
                items={[
                  { value: "day", label: "日" },
                  { value: "week", label: "週" },
                  { value: "month", label: "月" },
                ]}
                defaultValue="week"
                size="sm"
                aria-label="期間"
              />
            </Labeled>
            <Labeled label="Dropdown">
              <Dropdown
                trigger={
                  <Button variant="secondary" size="icon" aria-label="操作メニュー">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                }
                items={[
                  { key: "edit", label: "編集" },
                  { key: "duplicate", label: "複製" },
                  { key: "delete", label: "削除", danger: true, separatorBefore: true },
                ]}
              />
            </Labeled>
            <Labeled label="ThemeToggle">
              <ThemeToggle />
            </Labeled>
          </Grid>
        </Section>

        <Section
          title="Inputs"
          note="ラベル・必須・エラーは FormField が持つ。入力部品に直接書かない。"
        >
          <Grid className="sm:grid-cols-2 lg:grid-cols-3">
            <Labeled label="Input">
              <Input placeholder="例: 備品購入の申請" aria-label="件名" />
            </Labeled>
            <Labeled label="SearchInput">
              <SearchInput placeholder="件名で検索" aria-label="検索" />
            </Labeled>
            <Labeled label="Select">
              <Select items={PRIORITIES} placeholder="優先度を選択" aria-label="優先度" />
            </Labeled>
            <Labeled label="Combobox">
              <Combobox items={SHOPS} placeholder="店舗を選択" aria-label="店舗" />
            </Labeled>
            <Labeled label="DatePicker">
              <DatePicker mode="single" placeholder="日付を選択" />
            </Labeled>
            <Labeled label="Textarea（shadcn/ui）">
              <Textarea placeholder="申請の内容" aria-label="内容" rows={2} />
            </Labeled>
            <Labeled label="Checkbox">
              <Stack className="space-y-2">
                <Checkbox label="メール通知を受け取る" defaultChecked />
                <Checkbox label="社内にも共有する" />
              </Stack>
            </Labeled>
            <Labeled label="RadioGroup">
              <RadioGroup items={PRIORITIES} defaultValue="mid" orientation="horizontal" />
            </Labeled>
            <Labeled label="FileDropZone">
              <FileDropZone
                files={[]}
                onFilesChange={() => {}}
                accept=".pdf"
                description="PDF のみ。10MB まで"
              />
            </Labeled>
            <Labeled label="Switch（shadcn/ui）">
              <div className="flex items-center gap-2">
                <Switch id="gallery-switch" defaultChecked />
                <Label htmlFor="gallery-switch">公開する</Label>
              </div>
            </Labeled>
            <Labeled label="FormField">
              <FormField label="件名" required error="件名は必須です">
                <Input error defaultValue="" />
              </FormField>
            </Labeled>
          </Grid>
        </Section>

        <Section
          title="Feedback"
          note="結果はトースト、確認はダイアログ、進行中はスピナー、残す注意は Alert。使い分けを固定する。"
        >
          <Grid className="sm:grid-cols-2 lg:grid-cols-3">
            <Labeled label="Alert">
              <Alert tone="warning" title="通知先が設定されていません">
                設定するまで担当者へメールが届きません。
              </Alert>
            </Labeled>
            <Labeled label="Tooltip（shadcn/ui）">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger render={<Button variant="secondary" size="sm" />}>
                    ホバーして表示
                  </TooltipTrigger>
                  <TooltipContent>短い補足</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Labeled>
            <Labeled label="toast">
              <Cluster>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => toast.success("保存しました")}
                >
                  成功
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => toast.error("保存に失敗しました", "再試行してください")}
                >
                  失敗
                </Button>
              </Cluster>
            </Labeled>
            <Labeled label="Dialog / ConfirmDialog / FormDialog">
              <Cluster>
                <Button variant="secondary" size="sm" onClick={() => setDialog("dialog")}>
                  詳細
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setDialog("confirm")}>
                  確認
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setDialog("form")}>
                  入力
                </Button>
              </Cluster>
            </Labeled>
            <Labeled label="Spinner / Progress（shadcn/ui）">
              <div className="space-y-3">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Spinner />
                  読み込み中...
                </span>
                <Progress value={64}>
                  <ProgressTrack>
                    <ProgressIndicator />
                  </ProgressTrack>
                </Progress>
              </div>
            </Labeled>
          </Grid>
        </Section>

        <Section title="Data Display" note="一覧は 0 件のときの表示まで含めて 1 つの部品として考える。">
          <div className="space-y-4">
            <Labeled label="Table">
              <Table<Request>
                columns={COLUMNS}
                rows={ROWS}
                rowKey={(r) => r.id}
                caption="申請の一覧"
              />
            </Labeled>
            <Grid className="sm:grid-cols-3">
              <Labeled label="Stat">
                <Stat label="未対応" value="12" unit="件" delta="+3 前週比" tone="negative" />
              </Labeled>
              <Labeled label="DescriptionList">
                <DescriptionList
                  items={[
                    { term: "申請番号", description: "SYS-2026-0001" },
                    { term: "申請者", description: "山田 太郎" },
                    { term: "承認日", description: null },
                  ]}
                />
              </Labeled>
              <Labeled label="Steps">
                <Steps items={[{ label: "取り込み" }, { label: "加工" }, { label: "出力" }]} current={1} />
              </Labeled>
              <Labeled label="Avatar（shadcn/ui）">
                <Cluster>
                  <Avatar size="sm">
                    <AvatarFallback>山</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarFallback>山</AvatarFallback>
                  </Avatar>
                  <Avatar size="lg">
                    <AvatarFallback>山</AvatarFallback>
                  </Avatar>
                </Cluster>
              </Labeled>
              <Labeled label="Badge">
                <Cluster>
                  <Badge tone="new">未対応</Badge>
                  <Badge tone="active">対応中</Badge>
                  <Badge tone="done">完了</Badge>
                  <Badge tone="danger">却下</Badge>
                </Cluster>
              </Labeled>
              <Labeled label="Pagination">
                <Pagination page={page} totalPages={10} onPageChange={setPage} />
              </Labeled>
              <Labeled label="Card（shadcn/ui）">
                <Card>
                  <CardHeader>
                    <CardTitle>承認待ち</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-semibold text-foreground">12</p>
                    <p className="text-xs text-muted-foreground">件</p>
                  </CardContent>
                </Card>
              </Labeled>
              <Labeled label="Item（shadcn/ui）">
                <Item>
                  <ItemMedia variant="icon">
                    <FileText />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>備品購入（モニター 2 台）</ItemTitle>
                    <ItemDescription>山田 太郎 / 2026-04-20</ItemDescription>
                  </ItemContent>
                </Item>
              </Labeled>
              <Labeled label="Label / Separator（shadcn/ui）">
                <div className="space-y-2">
                  <Label>申請区分</Label>
                  <Separator />
                  <p className="text-sm text-muted-foreground">備品購入</p>
                </div>
              </Labeled>
            </Grid>
          </div>
        </Section>

        <Section title="Navigation" note="同一画面の切り替えはタブ、画面遷移はナビゲーション。混ぜない。">
          <Grid>
            <Labeled label="PageHeader">
              <PageHeader
                headingLevel={2}
                breadcrumbs={[{ label: "ホーム", href: "#" }, { label: "アイデア" }]}
                title="アイデア一覧"
                description="社内から寄せられた意見・提案"
                actions={
                  <Button size="sm" leftIcon={<Plus />}>
                    新規作成
                  </Button>
                }
                className="mb-0"
              />
            </Labeled>
            <Labeled label="PageSection">
              <PageSection title="申請内容" description="面を持たない節。まとまりは見出しと余白で作る">
                <p className="text-sm">本文</p>
              </PageSection>
            </Labeled>
            <Labeled label="Breadcrumbs">
              <Breadcrumbs
                items={[{ label: "ホーム", href: "#" }, { label: "アイデア", href: "#" }, { label: "モニターの増設" }]}
              />
            </Labeled>
            <Labeled label="Accordion（shadcn/ui）">
              <Accordion defaultValue={["faq-1"]}>
                <AccordionItem value="faq-1">
                  <AccordionTrigger>配送について</AccordionTrigger>
                  <AccordionContent>通常 2〜3 営業日でお届けします。</AccordionContent>
                </AccordionItem>
                <AccordionItem value="faq-2">
                  <AccordionTrigger>返品・交換</AccordionTrigger>
                  <AccordionContent>到着後 14 日以内であれば承ります。</AccordionContent>
                </AccordionItem>
              </Accordion>
            </Labeled>
            <Labeled label="Tabs">
              <Tabs
                items={[
                  {
                    value: "overview",
                    label: "概要",
                    content: <p className="text-sm text-foreground">概要の内容。</p>,
                  },
                  {
                    value: "history",
                    label: "履歴",
                    content: <p className="text-sm text-foreground">変更履歴。</p>,
                  },
                ]}
              />
            </Labeled>
            <Labeled label="NavItem">
              <div className="w-56 space-y-1 rounded-xl border border-border bg-card p-2">
                <NavItem
                  href="#"
                  active
                  icon={<FileText className="w-4 h-4" />}
                  label="申請一覧"
                  badge={12}
                />
                <NavItem href="#" icon={<Calendar className="w-4 h-4" />} label="予定" />
                <NavItem href="#" icon={<Search className="w-4 h-4" />} label="検索" />
              </div>
            </Labeled>
          </Grid>
        </Section>

        <Section title="Empty State" note="0 件は必ず文章で伝え、次にできる操作を添える。">
          <Grid>
            <Labeled label="Empty（shadcn/ui）">
              <Card>
                <CardContent>
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <FileText />
                      </EmptyMedia>
                      <EmptyTitle>まだ申請がありません</EmptyTitle>
                      <EmptyDescription>
                        最初の申請を作成すると、ここに一覧が表示されます。
                      </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                      <Button leftIcon={<Plus className="w-4 h-4" />}>
                        新規申請
                      </Button>
                    </EmptyContent>
                  </Empty>
                </CardContent>
              </Card>
            </Labeled>
            <Labeled label="Table（0 件）">
              <Table<Request>
                columns={COLUMNS}
                rows={[]}
                emptyMessage="申請がありません"
                emptySubMessage="「新規申請」から作成してください"
                caption="申請の一覧（0 件）"
              />
            </Labeled>
          </Grid>
        </Section>

        <Dialog
          open={dialog === "dialog"}
          onOpenChange={(next) => !next && setDialog(null)}
          title="申請の詳細"
          description="内容を確認してください"
          onConfirm={() => setDialog(null)}
          onCancel={() => setDialog(null)}
        >
          <p className="text-sm text-muted-foreground">申請番号 SYS-2026-0001 の内容です。</p>
        </Dialog>

        <ConfirmDialog
          open={dialog === "confirm"}
          onOpenChange={(next) => !next && setDialog(null)}
          type="danger"
          title="申請の削除"
          message="この申請を削除します。削除すると元に戻せません。"
          confirmText="削除する"
          onConfirm={() => setDialog(null)}
        />

        <FormDialog
          open={dialog === "form"}
          onOpenChange={(next) => !next && setDialog(null)}
          title="新規申請の作成"
          onSubmit={(event) => {
            event.preventDefault();
            setDialog(null);
          }}
          onCancel={() => setDialog(null)}
        >
          <FormField label="件名" required>
            <Input name="title" placeholder="例: 備品購入の申請" />
          </FormField>
          <FormField label="優先度" required>
            <Select name="priority" items={PRIORITIES} placeholder="優先度を選択" />
          </FormField>
        </FormDialog>
      </Showcase>
    );
  },
};