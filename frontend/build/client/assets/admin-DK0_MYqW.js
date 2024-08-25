import{r,j as s}from"./context-vN2-4QuS.js";import{c as x}from"./clsx-B-dksMZM.js";import{r as h}from"./requireLogin-BXrannRr.js";import{u as f}from"./useTranslation-CesOUbzQ.js";import{q as j,L as p}from"./components-NKq783Lw.js";import"./contexts-CgsfAxcF.js";const q={i18n:"admin"},D=({data:e})=>[{title:e.title}],N=()=>{const{t:e}=f("admin"),n=j(),c=r.useCallback(()=>{fetch("/api/admin").then(async a=>{const l=await a.json();l.code==="forbidden"&&n("/"),o(l.data)})},[n]);r.useEffect(()=>{c();const a=setInterval(c,1e4);return()=>clearInterval(a)},[c]);const[t,o]=r.useState(null),d="bg-slate-100 dark:bg-slate-800 rounded-md p-4",i=x(d,"w-full md:w-80"),m=x(d,"w-full");return t?s.jsx(s.Fragment,{children:s.jsxs("div",{children:[s.jsx("h1",{className:"page-title",children:e("title")}),s.jsxs("div",{className:"flex flex-col md:flex-row md:flex-wrap gap-4",children:[s.jsxs("div",{className:i,children:[s.jsx("h2",{className:"text-xl font-bold",children:e("stats.users.title")}),s.jsx("p",{className:"text-4xl font-bold",children:t.stats.users.original+t.stats.users.alt}),s.jsxs("div",{className:"flex flex-col",children:[s.jsxs("div",{className:"flex",children:[s.jsx("p",{className:"flex-1",children:e("stats.users.original")}),s.jsx("p",{className:"flex-1 text-right",children:t.stats.users.original})]}),s.jsxs("div",{className:"flex",children:[s.jsx("p",{className:"flex-1",children:e("stats.users.alt")}),s.jsx("p",{className:"flex-1 text-right",children:t.stats.users.alt})]}),s.jsxs("div",{className:"flex",children:[s.jsx("p",{className:"flex-1",children:e("stats.users.discord")}),s.jsx("p",{className:"flex-1 text-right",children:t.stats.users.discord})]})]})]}),s.jsxs("div",{className:i,children:[s.jsx("h2",{className:"text-xl font-bold",children:e("stats.charts.title")}),s.jsx("p",{className:"text-4xl font-bold",children:t.stats.charts.public+t.stats.charts.private}),s.jsxs("div",{className:"flex flex-col",children:[s.jsxs("div",{className:"flex",children:[s.jsx("p",{className:"flex-1",children:e("stats.charts.public")}),s.jsx("p",{className:"flex-1 text-right",children:t.stats.charts.public})]}),s.jsxs("div",{className:"flex",children:[s.jsx("p",{className:"flex-1",children:e("stats.charts.private")}),s.jsx("p",{className:"flex-1 text-right",children:t.stats.charts.private})]})]})]}),s.jsxs("div",{className:i,children:[s.jsx("h2",{className:"text-xl font-bold",children:e("stats.files")}),s.jsx("p",{className:"text-4xl font-bold",children:[...Object.values(t.stats.files)].reduce((a,l)=>a+l,0)}),s.jsx("div",{className:"flex flex-col",children:Object.entries(t.stats.files).map(([a,l])=>s.jsxs("div",{className:"flex",children:[s.jsx("p",{className:"flex-1",children:a}),s.jsx("p",{className:"flex-1 text-right",children:l})]},a))})]}),s.jsxs("div",{className:i,children:[s.jsx("h2",{className:"text-xl font-bold",children:e("stats.db.title")}),s.jsx("div",{className:"flex flex-col",children:s.jsx("p",{className:"flex-1",children:e("stats.db.connections",t.stats.db)})})]}),s.jsxs("div",{className:i,children:[s.jsx("h2",{className:"text-xl font-bold",children:e("sidekiq.title")}),s.jsx("p",{className:"text-md",children:s.jsx(p,{to:"/admin/sidekiq",target:"_blank",children:e("sidekiq.description")})})]})]}),s.jsx("h2",{className:"text-xl font-bold mt-4",children:e("actions.title")}),s.jsx("div",{className:"flex flex-col md:flex-row md:flex-wrap gap-4",children:s.jsxs("div",{className:m,children:[s.jsx("h3",{className:"text-md font-bold",children:e("actions.expireData.title")}),s.jsx("p",{children:e("actions.expireData.description")}),s.jsx("div",{className:"button-primary mt-2 p-2",onClick:async()=>{const{data:{count:a}}=await fetch("/api/admin/expire-data",{method:"POST"}).then(l=>l.json());alert(e("actions.expireData.success",{count:a}))},children:e("actions.expireData.button")})]})})]})}):null},C=h(N);export{C as default,q as handle,D as meta};
