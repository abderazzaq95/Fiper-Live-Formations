import { ArrowUpLeft, Download, Globe2, MousePointerClick, TrendingUp, UserRoundCheck } from "lucide-react";

const sources = [
  { name: "Instagram", value: 42, color: "bg-[#C32828]" },
  { name: "WhatsApp", value: 28, color: "bg-[#168a65]" },
  { name: "Direct", value: 18, color: "bg-[#1779b5]" },
  { name: "Facebook", value: 12, color: "bg-[#7059c8]" },
];

export default function ReportsPage() {
  return (
    <div className="mx-auto max-w-[1300px]">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-[10px] font-bold text-[#C32828]">التحليلات</p><h1 className="mt-2 text-2xl font-bold tracking-[-0.035em] sm:text-3xl">التقارير</h1><p className="mt-2 text-xs text-[#788d9c]">افهم مصادر التسجيل والتحويل والحضور.</p></div><button className="flex h-11 items-center gap-2 rounded-xl bg-[#102f47] px-5 text-[9px] font-bold text-white"><Download size={15} /> تنزيل التقرير</button></div>
      <div className="mt-7 grid gap-4 sm:grid-cols-3">{[["زيارات الصفحة","4,820","+24%",Globe2],["نسبة التحويل","7.18%","+1.6%",MousePointerClick],["نسبة الحضور","78%","+6.2%",UserRoundCheck]].map(([label,value,change,Icon]) => {const CardIcon=Icon as typeof Globe2;return <div key={String(label)} className="rounded-[20px] border border-[#dfe7ec] bg-white p-5"><div className="flex justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf5fc] text-[#1574ad]"><CardIcon size={18} /></span><span className="latin flex items-center gap-1 text-[9px] font-bold text-[#168a65]"><ArrowUpLeft size={12}/>{String(change)}</span></div><p className="mt-5 text-[9px] text-[#7f929f]">{String(label)}</p><strong className="latin mt-2 block text-2xl">{String(value)}</strong></div>})}</div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className="rounded-[22px] border border-[#dfe7ec] bg-white p-6"><div className="flex items-center gap-2"><TrendingUp size={17} className="text-[#C32828]" /><h2 className="text-sm font-bold">مصادر التسجيل</h2></div><div className="mt-8 space-y-6">{sources.map((source) => <div key={source.name}><div className="mb-2 flex justify-between text-[9px]"><span className="latin font-semibold">{source.name}</span><span className="latin font-bold">{source.value}%</span></div><div className="h-2 overflow-hidden rounded-full bg-[#edf2f5]"><div className={`h-full rounded-full ${source.color}`} style={{width:`${source.value}%`}} /></div></div>)}</div></section>
        <section className="rounded-[22px] border border-[#dfe7ec] bg-white p-6"><h2 className="text-sm font-bold">قمع التحويل</h2><p className="mt-1 text-[9px] text-[#91a2ae]">دورة أساسيات الفوركس</p><div className="mt-7 space-y-3">{[["زيارة الصفحة","4,820","100%","bg-[#dcecf6]"],["بدء التسجيل","612","12.7%","bg-[#9fc9e1]"],["إكمال التسجيل","346","7.18%","bg-[#1779b5]"],["تأكيد الحضور","318","6.59%","bg-[#0b527e]"]].map(([label,value,percent,color],index)=><div key={label} className={`mx-auto flex h-14 items-center justify-between rounded-xl px-5 ${color}`} style={{width:`${100-index*9}%`}}><span className={`text-[9px] font-bold ${index>1?"text-white":"text-[#294c63]"}`}>{label}</span><span className={`latin text-[10px] font-bold ${index>1?"text-white":"text-[#294c63]"}`}>{value} · {percent}</span></div>)}</div></section>
      </div>
    </div>
  );
}
