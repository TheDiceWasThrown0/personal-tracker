import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Power, Brain, GraduationCap, Zap, Activity, ListTodo, Moon, BatteryWarning } from "lucide-react"

export function DailySchedule() {
    const scheduleItems = [
        {
            time: "06:00",
            title: "強制再起動",
            description: "スヌーズ機能は甘えです。アラームと同時に起床し、5分以内に冷水で顔を洗い、日光を目に入れます。",
            icon: Power,
            color: "text-red-500",
            bg: "bg-red-500/10",
            border: "border-red-500/20"
        },
        {
            time: "06:15 - 07:00",
            title: "ドーパミン遮断・脳のアイドリング",
            description: "朝のこの時間はスマホの通知確認やSNSを一切禁じます。前日の復習や、その日の最も重要な思考タスクの整理（1日の計画）にのみ使います。",
            icon: Brain,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
            border: "border-orange-500/20"
        },
        {
            time: "08:00 - 学校終了まで",
            title: "外部環境への適応",
            description: "学校の時間は社会的な拘束時間です。無駄なエネルギーを消費せず、淡々とタスク（学業や人間関係）をこなすことに徹してください。",
            icon: GraduationCap,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20"
        },
        {
            time: "学校終了後 〜 19:00",
            title: "ディープ・ワーク（深沈思の実行）",
            description: "ここが勝負の分かれ目です。帰宅して「少し休む」という選択肢はシステム上存在しません。帰宅した瞬間に机に向かい、その日最も負荷の高い勉強や作業を連続して行います。火曜・水曜はこの時間が長く取れるため、ここで1週間分のアドバンテージを稼ぎます。",
            icon: Zap,
            color: "text-yellow-500",
            bg: "bg-yellow-500/10",
            border: "border-yellow-500/20"
        },
        {
            time: "19:00 - 20:30",
            title: "肉体とシステムのメンテナンス",
            description: "夕食、入浴、軽いストレッチなどの物理的なメンテナンス時間です。ここで初めて、脳を休めるための「意図的なリラックス」を許可します。",
            icon: Activity,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20"
        },
        {
            time: "20:30 - 21:30",
            title: "シャロー・ワーク（浅い作業）と翌日の準備",
            description: "単純作業や、カバンの中身の整理、明日の着替えの準備など、脳のエネルギーを使わない作業をすべてここで終わらせます。",
            icon: ListTodo,
            color: "text-stone-400",
            bg: "bg-stone-500/10",
            border: "border-stone-500/20"
        },
        {
            time: "21:30 - 22:30",
            title: "デジタル・サンセット（強制隔離への移行）",
            description: "21時30分をもって、すべてのブルーライト（スマホ、PC）への接触を禁じます。照明を暗くし、読書や瞑想など、脳の活動を強制的にクールダウンさせる儀式を行います。",
            icon: BatteryWarning,
            color: "text-indigo-400",
            bg: "bg-indigo-500/10",
            border: "border-indigo-500/20"
        },
        {
            time: "22:30",
            title: "システム・シャットダウン（完全就寝）",
            description: "23時ではなく、22時30分に目を閉じます。これで翌朝6時まで、完璧な7.5時間の睡眠サイクルを確保します。",
            icon: Moon,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            border: "border-purple-500/20"
        }
    ]

    return (
        <Card className="bg-stone-900/50 backdrop-blur-md border-stone-800 shadow-2xl relative overflow-hidden group">
            <CardHeader className="border-b border-stone-800/50 pb-4">
                <CardTitle className="text-xl font-black text-stone-200 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-orange-500" />
                    System Core Directives (Absolute Routine)
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="space-y-4">
                    {scheduleItems.map((item, index) => (
                        <div key={index} className="flex gap-4 p-4 rounded-2xl bg-stone-950/50 border border-stone-800/50 hover:bg-stone-900/80 transition-colors">
                            <div className="flex-shrink-0 mt-1">
                                <div className={`p-3 rounded-xl ${item.bg} ${item.border} border`}>
                                    <item.icon className={`w-6 h-6 ${item.color}`} />
                                </div>
                            </div>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-sm bg-stone-800 text-stone-300">
                                        {item.time}
                                    </span>
                                    <h3 className={`font-bold text-base md:text-lg ${item.color}`}>
                                        {item.title}
                                    </h3>
                                </div>
                                <p className="text-sm text-stone-400 font-medium leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
