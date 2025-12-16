"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Award, BookOpen, CheckCircle, TrendingUp, Flag } from "lucide-react";
import Link from "next/link";

interface Stats {
  totalQuestions: number;
  totalQuizzes: number;
  totalAnswered: number;
  accuracy: string;
  wrongQuestionsCount: number;
  masteredQuestionsCount: number;
}

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error(err));
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-6xl mx-auto space-y-8"
    >
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-slate-800 mb-2">歡迎回來，同學</h1>
        <p className="text-slate-500">準備好開始今天的學習了嗎？</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="總題數"
          value={stats?.totalQuestions || 0}
          icon={BookOpen}
          color="bg-blue-500"
          delay={0}
        />
        <StatCard
          title="總測驗次數"
          value={stats?.totalQuizzes || 0}
          icon={Award}
          color="bg-purple-500"
          delay={0.1}
        />
        <StatCard
          title="總答題數"
          value={stats?.totalAnswered || 0}
          icon={CheckCircle}
          color="bg-emerald-500"
          delay={0.2}
        />
        <StatCard
          title="答題正確率"
          value={`${stats?.accuracy || 0}%`}
          icon={TrendingUp}
          color="bg-orange-500"
          delay={0.3}
        />

        {/* New Stats */}
        <Link href="/questions/wrong" className="block">
          <StatCard
            title="歷史錯題"
            value={stats?.wrongQuestionsCount || 0}
            icon={Flag}
            color="bg-red-500"
            delay={0.4}
            clickable
          />
        </Link>
        <Link href="/questions/mastered" className="block">
          <StatCard
            title="已熟悉題目"
            value={stats?.masteredQuestionsCount || 0}
            icon={CheckCircle}
            color="bg-green-500"
            delay={0.5}
            clickable
          />
        </Link>
      </div>

      {/* Quick Actions */}
      <h2 className="text-2xl font-bold text-slate-800 mt-12 mb-6">快速開始</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ActionCard
          title="開始測驗"
          description="自訂題數，開始練習"
          href="/quiz/setup"
          gradient="from-blue-500 to-blue-600"
        />
        <ActionCard
          title="錯題複習"
          description="針對歷史錯題進行加強同時消除錯題紀錄"
          href="/quiz/wrong-review"
          gradient="from-red-500 to-red-600"
        />
        <ActionCard
          title="無盡模式"
          description="無限挑戰，即時回饋"
          href="/quiz/endless"
          gradient="from-pink-500 to-pink-600"
        />
        <ActionCard
          title="建立題庫"
          description="匯入新的題目"
          href="/questions/create"
          gradient="from-emerald-500 to-emerald-600"
        />
        <ActionCard
          title="題庫清單"
          description="瀏覽與管理題目"
          href="/questions"
          gradient="from-purple-500 to-purple-600"
        />
        <ActionCard
          title="歷史紀錄"
          description="查看過去的成績"
          href="/history"
          gradient="from-orange-500 to-orange-600"
        />
      </div>
    </motion.div>
  );
}

function StatCard({ title, value, icon: Icon, color, delay, clickable }: any) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
      }}
      className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 ${clickable ? 'hover:shadow-md transition-shadow cursor-pointer' : ''}`}
    >
      <div className={`${color} p-4 rounded-xl text-white shadow-lg shadow-gray-200`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-slate-400 font-medium">{title}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
    </motion.div>
  );
}

function ActionCard({ title, description, href, gradient }: any) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`bg-gradient-to-br ${gradient} p-8 rounded-2xl text-white shadow-lg cursor-pointer h-full flex flex-col justify-center`}
      >
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <p className="opacity-90">{description}</p>
      </motion.div>
    </Link>
  );
}
