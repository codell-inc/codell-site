export const features = [
  { title: "案件登録", description: "利用者情報や現場情報を登録し、住宅改修に必要な情報を案件ごとにまとめます。", icon: "/sonovade/assets/icon-case.png" },
  { title: "図面作成", description: "スマホ・タブレットの直感的な操作で、現地調査中に間取りを作成できます。", icon: "/sonovade/assets/icon-plan.png" },
  { title: "改修箇所入力", description: "図面上に手すりや改修箇所、寸法を入力し、施工内容を分かりやすく可視化します。", icon: "/sonovade/assets/icon-renovation.png" },
  { title: "部材・原価計算", description: "商品を選ぶだけで必要な部材、数量、金額を反映。変更にもすぐ対応できます。", icon: "/sonovade/assets/icon-cost.png" },
  { title: "写真管理", description: "改修前後の写真を案件や施工箇所に紐づけ、写真台帳の作成へつなげます。", icon: "/sonovade/assets/icon-photo.png" },
] as const;

export const values = [
  { titleLines: ["スマホ・タブレットで", "図面を簡単作成"], description: "直感的な操作で、現地調査中に図面を作成。紙へ書いた情報を帰社後に転記する手間を減らします。", image: "/sonovade/assets/app-floor-plan.png", alt: "ソノバデで作成した住宅改修の施工箇所図面", width: 533, height: 399 },
  { titleLines: ["施工場所を入れるだけで、", "見積書・申請書類へ"], description: "施工箇所と寸法を入力すると、必要な部材と金額を案件へ反映。書類作成の手間とタイムラグを短縮します。", image: "/sonovade/assets/app-item-editor.png", alt: "施工箇所に必要な部材を選択するソノバデの画面", width: 533, height: 398 },
  { titleLines: ["写真を施工箇所ごとに、", "分かりやすく整理"], description: "改修前後の写真を図面上の施工箇所へ紐づけて管理。写真台帳や申請書類の準備へつなげます。", image: "/sonovade/assets/app-photo-show.png", alt: "施工箇所ごとに改修前後の写真を管理するソノバデの画面", width: 2234, height: 1678 },
  { titleLines: ["商品を選ぶだけで、", "金額を即座に反映"], description: "部材や商品の変更も選び直すだけ。その場で概算を確認し、お客様との相談を進められます。", image: "/sonovade/assets/app-estimate.png", alt: "部材と金額を一覧表示したソノバデの見積書画面", width: 533, height: 398 },
] as const;
