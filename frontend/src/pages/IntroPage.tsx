import { Link } from "react-router-dom";
import { Sparkles, BookOpen, BrainCircuit, GraduationCap, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/button";

export default function IntroPage() {
  const features = [
    {
      title: "스마트 번역기",
      description: "어려운 단어나 복잡한 문장을 알기 쉬운 우리말로 풀어서 번역해 드립니다.",
      icon: <Sparkles className="h-6 w-6 text-blue-500" />,
      color: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "나만의 단어장",
      description: "헷갈리고 생소한 우리말 단어를 저장하고 체계적으로 복습하며 어휘력을 기르세요.",
      icon: <BookOpen className="h-6 w-6 text-emerald-500" />,
      color: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      title: "읽기 훈련",
      description: "다양한 수준의 지문을 읽고 핵심 문맥을 파악하며 깊이 있는 문해력을 향상시킬 수 있습니다.",
      icon: <GraduationCap className="h-6 w-6 text-purple-500" />,
      color: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      title: "멀티 퀴즈",
      description: "다른 사람들과 실시간으로 우리말 어휘 및 독해 퀴즈 대결을 펼치며 재미있게 학습해 보세요.",
      icon: <BrainCircuit className="h-6 w-6 text-amber-500" />,
      color: "bg-amber-50 dark:bg-amber-900/20",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center bg-linear-to-b from-slate-50 to-white dark:from-slate-950 dark:to-background">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 shadow-sm">
          <Sparkles className="h-4 w-4 text-blue-500" />
          <span>현대인을 위한 문해력 향상의 시작</span>
        </div>
        <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
          당신의 문해력 잠재력을 <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-500 to-emerald-500">
            슬기롭게 틔우다
          </span>
        </h1>
        <p className="mb-10 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
          슬기틔움은 낯선 문장을 쉽게 풀어주는 AI 번역기부터 체계적인 단어장, 읽기 훈련, 그리고 실시간 멀티 퀴즈까지
          <br className="hidden sm:block" /> 단 하나의 플랫폼에서 완벽한 한글 문해력 학습 경험을 제공합니다.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Button asChild size="lg" className="h-12 px-8 text-base rounded-full bg-linear-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 border-0">
            <Link to="/login">
              시작하기 <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 px-8 text-base rounded-full border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900">
            <Link to="/signup">회원가입</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-24 bg-white dark:bg-background border-t border-slate-100 dark:border-slate-900">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-white">문해력을 키우는 다양한 기능</h2>
            <p className="text-slate-600 dark:text-slate-400">나에게 맞는 방식으로 쉽고 재미있게 어휘력을 기르세요.</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group flex flex-col items-center text-center p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-card transition-all hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-900"
              >
                <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-xl transition-transform group-hover:scale-110 ${feature.color}`}>
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
