import type { Handle, RemixNode } from "remix/ui";
import { css } from "remix/ui";
import { routes } from "../routes.ts";
import { Document } from "./document.tsx";
import { AppLayout } from "./AppLayout.tsx";

export function HomePage() {
  return () => (
    <Document head={<HomeHead />}>
      <AppLayout activeRoute="home">
        <div
          mix={css({
            padding: "48px 24px",
            maxWidth: "1000px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: "56px",
            width: "100%",
            boxSizing: "border-box",
            "@media (max-width: 767px)": {
              padding: "32px 16px",
              gap: "40px",
            },
          })}
        >
          {/* Hero Section */}
          <section
            mix={css({
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: "24px",
              padding: "40px 0",
            })}
          >
            <div
              mix={css({
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "12px",
                borderRadius: "20px",
                background: "var(--accent-light)",
                color: "var(--accent-color)",
                marginBottom: "8px",
              })}
            >
              <HeroLogoIcon size={48} />
            </div>

            <h1
              mix={css({
                fontSize: "42px",
                fontWeight: "bold",
                margin: 0,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
                "@media (max-width: 767px)": {
                  fontSize: "32px",
                },
              })}
            >
              Murder Mystery Memo
            </h1>

            <p
              mix={css({
                fontSize: "16px",
                color: "var(--text-secondary)",
                maxWidth: "600px",
                margin: "0 auto",
                lineHeight: 1.6,
                fontWeight: 500,
              })}
            >
              アリバイの整理、タイムラインの構築、発言ログの記録をシームレスに。
              マーダーミステリーの議論を整理し、事件の真相へと導くための専用メモツール。
            </p>

            <div
              mix={css({
                display: "flex",
                gap: "16px",
                justifyContent: "center",
                marginTop: "16px",
                "@media (max-width: 480px)": {
                  flexDirection: "column",
                  width: "100%",
                },
              })}
            >
              <a
                href={routes.memo.href()}
                rmx-document=""
                mix={css({
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "14px 28px",
                  borderRadius: "12px",
                  background: "var(--accent-color)",
                  color: "#ffffff",
                  textDecoration: "none",
                  fontWeight: "bold",
                  fontSize: "15px",
                  boxShadow: "0 4px 12px rgba(45, 172, 249, 0.25)",
                  transition: "all 200ms ease",
                  "&:hover": {
                    background: "var(--accent-hover)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 16px rgba(45, 172, 249, 0.35)",
                  },
                  "@media (max-width: 480px)": {
                    width: "100%",
                  },
                })}
              >
                メモを開始する
                <span mix={css({ marginLeft: "8px", display: "inline-block" })}>→</span>
              </a>
            </div>
          </section>

          {/* Features Grid */}
          <section mix={css({ display: "flex", flexDirection: "column", gap: "24px" })}>
            <h2
              mix={css({
                fontSize: "20px",
                fontWeight: "bold",
                margin: 0,
                textAlign: "center",
                color: "var(--text-primary)",
              })}
            >
              主な機能
            </h2>

            <div
              mix={css({
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "24px",
                "@media (max-width: 900px)": {
                  gridTemplateColumns: "1fr",
                },
              })}
            >
              <FeatureCard
                icon={<TimelineIcon />}
                title="タイムラインの自動構築"
                description="「>12:00 発見」のように時間を指定して入力すると、自動的に時系列のタイムラインを組み立てて整理します。"
              />
              <FeatureCard
                icon={<UsersIcon />}
                title="プレイヤーの紐付け"
                description="「@探偵」のようにプレイヤーを指定して発言や行動を記録。プレイヤーごとのアリバイ追跡が容易になります。"
              />
              <FeatureCard
                icon={<LightbulbIcon />}
                title="議論に集中できるUI"
                description="ゲーム中の短い議論時間の中でも思考を妨げない、シンプルで素早く記録できるマークアップ入力インターフェース。"
              />
            </div>
          </section>

          {/* How to use */}
          <section
            mix={css({
              background: "var(--bg-card)",
              borderRadius: "16px",
              padding: "32px",
              border: "1px solid var(--border-color)",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              "@media (max-width: 767px)": {
                padding: "24px",
              },
            })}
          >
            <h2
              mix={css({
                fontSize: "18px",
                fontWeight: "bold",
                margin: 0,
                color: "var(--text-primary)",
              })}
            >
              簡単な使い方
            </h2>

            <div
              mix={css({
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                counterReset: "step",
              })}
            >
              <StepItem text="サイドメニューまたは上のボタンから「タイムラインメモ」に移動します。" />
              <StepItem text="テキストエリアで「@プレイヤー名」や「>時間（例: >10:30）」を入力して、議論やアリバイをメモします。" />
              <StepItem text="追加されたメモはタイムラインとして自動で並び替えられ、容疑者たちの怪しい行動が一目で分かるようになります。" />
            </div>
          </section>
        </div>
      </AppLayout>
    </Document>
  );
}

function HomeHead() {
  return () => (
    <>
      <meta name="color-scheme" content="light dark" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap"
      />
    </>
  );
}

interface FeatureCardProps {
  icon: RemixNode;
  title: string;
  description: string;
}

function FeatureCard(handle: Handle<FeatureCardProps>) {
  return () => {
    const { icon, title, description } = handle.props;
    return (
      <div
        mix={css({
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: "16px",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          transition: "all 200ms ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 10px 20px rgba(0, 0, 0, 0.05)",
            borderColor: "var(--accent-color)",
          },
        })}
      >
        <div
          mix={css({
            color: "var(--accent-color)",
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--accent-light)",
            borderRadius: "10px",
            "& svg": {
              width: "22px",
              height: "22px",
            },
          })}
        >
          {icon}
        </div>
        <h3
          mix={css({
            fontSize: "16px",
            fontWeight: "bold",
            margin: 0,
            color: "var(--text-primary)",
          })}
        >
          {title}
        </h3>
        <p
          mix={css({
            fontSize: "13px",
            color: "var(--text-secondary)",
            margin: 0,
            lineHeight: 1.6,
          })}
        >
          {description}
        </p>
      </div>
    );
  };
}

interface StepItemProps {
  text: string;
}

function StepItem(handle: Handle<StepItemProps>) {
  return () => {
    const { text } = handle.props;
    return (
      <div
        mix={css({
          display: "flex",
          gap: "16px",
          alignItems: "flex-start",
        })}
      >
        <div
          mix={css({
            flexShrink: 0,
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            background: "var(--accent-color)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            fontWeight: "bold",
            "&::before": {
              counterIncrement: "step",
              content: "counter(step)",
            },
          })}
        />
        <p
          mix={css({
            margin: 0,
            fontSize: "14px",
            color: "var(--text-primary)",
            lineHeight: 1.6,
            paddingTop: "2px",
          })}
        >
          {text}
        </p>
      </div>
    );
  };
}

// Icons
function HeroLogoIcon(handle: Handle<{ size?: number }>) {
  return () => {
    const size = handle.props.size ?? 24;
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5z" />
        <path d="M6 6h10" />
        <path d="M6 10h10" />
        <circle cx="14" cy="15" r="3" />
        <path d="m17 18 3 3" />
      </svg>
    );
  };
}

function TimelineIcon() {
  return () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function UsersIcon() {
  return () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function LightbulbIcon() {
  return () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1 .3 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  );
}
