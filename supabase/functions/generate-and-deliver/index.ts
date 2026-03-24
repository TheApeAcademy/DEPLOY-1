import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { assignment_id } = await req.json();
    if (!assignment_id) throw new Error("assignment_id required");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: assignment, error: fetchError } = await supabase
      .from("assignments")
      .select("*")
      .eq("id", assignment_id)
      .single();

    if (fetchError || !assignment) throw new Error("Assignment not found: " + fetchError?.message);
    console.log(`🦍 Generating for: ${assignment.user_name} — ${assignment.assignment_type}`);

    await supabase.from("assignments").update({ status: "generating" }).eq("id", assignment_id);

    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": Deno.env.get("ANTHROPIC_API_KEY")!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        system: `You are ApeAcademy's elite academic expert. Generate complete, university-level academic content. Respond ONLY with a valid JSON object — no markdown fences, no preamble, no extra text. Use exactly this structure: {"doc_title":"Specific academic title","introduction":"3 paragraphs separated by double newlines","concept_explanation":"3 paragraphs separated by double newlines","key_point":"The single most critical insight","main_body":"5 paragraphs separated by double newlines","deep_understanding":"2 paragraphs separated by double newlines","deep_insight":"One advanced examiner-level observation","summary_points":["point 1","point 2","point 3","point 4","point 5"],"glossary":[{"term":"Term","definition":"Definition"},{"term":"Term","definition":"Definition"},{"term":"Term","definition":"Definition"},{"term":"Term","definition":"Definition"},{"term":"Term","definition":"Definition"}],"practice_questions":[{"q":"Question?","a":"Answer"},{"q":"Question?","a":"Answer"},{"q":"Question?","a":"Answer"},{"q":"Question?","a":"Answer"},{"q":"Question?","a":"Answer"}],"quote":"Relevant quote","quote_author":"Author"}`,
        messages: [{
          role: "user",
          content: `Generate a complete academic document:\n\nStudent: ${assignment.user_name}\nType: ${assignment.assignment_type}\nCourse: ${assignment.course_name || "N/A"}\nClass: ${assignment.class_name || "N/A"}\nTeacher: ${assignment.teacher_name || "N/A"}\nDue: ${assignment.due_date || "N/A"}\nComplexity: ${assignment.complexity || "standard"}\n\nBrief:\n${assignment.description}\n\nMake it genuinely impressive — accurate, well-structured, university-level.`
        }]
      })
    });

    if (!claudeRes.ok) throw new Error(`Claude API ${claudeRes.status}: ${await claudeRes.text()}`);
    const claudeData = await claudeRes.json();
    const rawText = claudeData.content?.[0]?.text || "";

    let content: any;
    try { content = JSON.parse(rawText); }
    catch {
      const m = rawText.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("No JSON in Claude response: " + rawText.substring(0, 200));
      content = JSON.parse(m[0]);
    }
    console.log(`✅ Claude done: ${content.doc_title}`);

    const s = (v: any) => String(v || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const paras = (t: string) => String(t || "").split(/\n\n+/).filter((p: string) => p.trim()).map((p: string) => `<p class="bp">${s(p)}</p>`).join('');
    const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>🦍 ${s(content.doc_title)} — ApeAcademy</title>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{background:#0d0d0d;font-family:'DM Sans',sans-serif;padding:16px;}
.nav{background:rgba(5,5,5,0.98);border:1px solid rgba(34,197,94,0.15);padding:12px 20px;display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;border-radius:10px;position:sticky;top:8px;z-index:99;}
.nav-brand{font-family:'Syne',sans-serif;font-weight:900;font-size:14px;color:#22c55e;letter-spacing:2px;}
.nav-hint{font-size:10px;color:rgba(134,239,172,0.35);font-family:'DM Mono',monospace;}
.pages{display:flex;flex-direction:column;gap:28px;max-width:900px;margin:0 auto;}
.pw{display:flex;flex-direction:column;gap:5px;}
.ptag{font-size:9px;font-weight:700;letter-spacing:2.5px;color:rgba(34,197,94,0.25);text-transform:uppercase;font-family:'DM Mono',monospace;text-align:center;}
.page{width:100%;border-radius:8px;overflow:hidden;box-shadow:0 12px 60px rgba(0,0,0,0.7);}
.cover{background:#050f07;position:relative;}
.geo{position:absolute;inset:0;pointer-events:none;background-image:repeating-linear-gradient(60deg,transparent,transparent 20px,rgba(34,197,94,0.05) 20px,rgba(34,197,94,0.05) 22px),repeating-linear-gradient(-60deg,transparent,transparent 20px,rgba(34,197,94,0.05) 20px,rgba(34,197,94,0.05) 22px);}
.cover-glow{position:absolute;width:100%;height:70%;background:radial-gradient(ellipse at 50% 0%,rgba(34,197,94,0.12),transparent 60%);top:0;pointer-events:none;}
.cover-in{position:relative;z-index:1;padding:clamp(24px,5vw,60px);}
.cover-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:clamp(32px,7vw,80px);}
.c-logo{display:flex;align-items:center;gap:10px;}
.c-logo-em{font-size:clamp(24px,5vw,36px);}
.c-logo-txt{font-family:'Syne',sans-serif;font-weight:900;font-size:clamp(14px,3vw,20px);color:#fff;letter-spacing:3px;}
.c-badge{background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.35);border-radius:100px;padding:6px 16px;font-size:clamp(9px,2vw,11px);font-weight:700;color:#4ade80;letter-spacing:1.5px;text-transform:uppercase;font-family:'DM Mono',monospace;}
.c-eyebrow{display:flex;align-items:center;gap:10px;margin-bottom:16px;}
.c-eyebrow-line{width:32px;height:2px;background:linear-gradient(90deg,#22c55e,transparent);}
.c-eyebrow-txt{font-size:clamp(9px,2vw,11px);font-weight:700;letter-spacing:3px;text-transform:uppercase;color:rgba(34,197,94,0.6);font-family:'DM Mono',monospace;}
.c-title{font-family:'Syne',sans-serif;font-weight:900;font-size:clamp(24px,6vw,52px);line-height:1.08;color:#fff;margin-bottom:clamp(14px,3vw,26px);}
.c-sub{font-size:clamp(11px,2.5vw,14px);color:rgba(255,255,255,0.4);line-height:1.8;max-width:500px;}
.c-divider{width:100%;height:1px;background:linear-gradient(90deg,rgba(34,197,94,0.4),rgba(34,197,94,0.1),transparent);margin:clamp(20px,4vw,36px) 0;}
.c-meta{display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(12px,3vw,24px);margin-bottom:clamp(20px,4vw,36px);}
.mc-l{font-size:clamp(7px,1.5vw,9px);font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(134,239,172,0.35);margin-bottom:5px;font-family:'DM Mono',monospace;}
.mc-v{font-size:clamp(11px,2.5vw,14px);color:rgba(255,255,255,0.8);font-weight:600;}
.c-foot{display:flex;align-items:center;justify-content:space-between;padding-top:clamp(14px,3vw,22px);border-top:1px solid rgba(34,197,94,0.1);}
.c-foot-t{font-size:clamp(8px,1.5vw,10px);color:rgba(134,239,172,0.25);font-family:'DM Mono',monospace;}
.internal{background:#fff;display:flex;}
.rstrip{width:clamp(18px,3vw,30px);background:#050f07;flex-shrink:0;position:relative;overflow:hidden;}
.rstrip::before{content:'';position:absolute;inset:0;background-image:repeating-linear-gradient(45deg,transparent,transparent 5px,rgba(34,197,94,0.2) 5px,rgba(34,197,94,0.2) 7px),repeating-linear-gradient(-45deg,transparent,transparent 5px,rgba(34,197,94,0.2) 5px,rgba(34,197,94,0.2) 7px);}
.sl{position:absolute;bottom:50px;left:50%;transform:translateX(-50%) rotate(90deg);white-space:nowrap;font-size:7px;font-weight:700;letter-spacing:2px;color:rgba(34,197,94,0.35);text-transform:uppercase;font-family:'DM Mono',monospace;}
.pb{flex:1;padding:clamp(20px,4vw,52px) clamp(20px,4vw,52px) clamp(70px,10vw,90px);position:relative;min-height:500px;}
.pgh{display:flex;align-items:center;justify-content:space-between;margin-bottom:clamp(18px,4vw,34px);padding-bottom:12px;border-bottom:2px solid #f0fdf4;}
.pgh-l{display:flex;align-items:center;gap:7px;}
.pgh-em{font-size:clamp(12px,2vw,15px);}
.pgh-br{font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(10px,2vw,13px);color:#15803d;letter-spacing:1.5px;}
.pgn{font-size:clamp(8px,1.5vw,10px);color:#6b7280;font-family:'DM Mono',monospace;background:#f0fdf4;padding:3px 10px;border-radius:5px;}
.sh{display:flex;align-items:center;gap:12px;margin-bottom:clamp(14px,3vw,22px);}
.sb{width:4px;height:clamp(22px,4vw,30px);border-radius:2px;background:linear-gradient(180deg,#22c55e,#15803d);flex-shrink:0;}
.st{font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(17px,4vw,24px);color:#052e16;}
.bp{font-size:clamp(11px,2vw,13.5px);line-height:1.85;color:#374151;margin-bottom:14px;}
.kp{background:linear-gradient(135deg,#f0fdf4,#dcfce7);border:1px solid #86efac;border-radius:10px;padding:clamp(12px,3vw,18px);display:flex;gap:12px;margin:18px 0;}
.kpd{background:#22c55e;color:#fff;font-weight:800;font-size:11px;min-width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.kpt{font-size:clamp(11px,2vw,13px);color:#166534;line-height:1.75;}
.pgft{position:absolute;bottom:clamp(14px,3vw,26px);left:clamp(20px,4vw,52px);right:clamp(20px,4vw,52px);display:flex;justify-content:space-between;padding-top:10px;border-top:1px solid #f0fdf4;}
.pgfl{font-size:clamp(8px,1.5vw,10px);color:#9ca3af;font-weight:700;letter-spacing:1px;}
.pgfr{font-size:clamp(8px,1.5vw,10px);color:#9ca3af;}
.en{background:linear-gradient(135deg,#fff7ed,#ffedd5);border:1px solid #fed7aa;border-radius:10px;padding:clamp(12px,3vw,18px);margin:18px 0;}
.ent{font-size:clamp(10px,2vw,12px);font-weight:700;color:#ea580c;margin-bottom:7px;}
.end{font-size:clamp(10px,2vw,12.5px);color:#9a3412;line-height:1.75;}
.qc{background:#fafafa;border:1px solid #e5e7eb;border-radius:10px;padding:clamp(12px,3vw,18px);margin-bottom:14px;}
.ql{font-size:clamp(8px,1.5vw,10px);font-weight:700;letter-spacing:2px;color:#9ca3af;text-transform:uppercase;margin-bottom:7px;font-family:'DM Mono',monospace;}
.qt{font-size:clamp(12px,2.5vw,14px);color:#111827;font-weight:600;margin-bottom:12px;line-height:1.65;}
.qa{font-size:clamp(10px,2vw,12.5px);color:#374151;line-height:1.75;background:#f0fdf4;padding:12px 14px;border-radius:8px;border-left:3px solid #22c55e;}
.qal{font-weight:700;color:#15803d;}
.smb{display:flex;gap:12px;align-items:flex-start;margin-bottom:12px;padding:10px;border-radius:8px;background:#fafafa;}
.smem{font-size:clamp(14px,3vw,18px);flex-shrink:0;}
.smt{font-size:clamp(11px,2vw,13px);line-height:1.8;color:#374151;padding-top:2px;}
.gi{display:flex;gap:16px;padding:12px 0;border-bottom:1px solid #f3f4f6;}
.gt{font-family:'DM Mono',monospace;font-size:clamp(10px,2vw,12px);color:#15803d;font-weight:500;min-width:130px;flex-shrink:0;}
.gd{font-size:clamp(10px,2vw,12.5px);color:#6b7280;line-height:1.65;}
.qcard{position:relative;background:#fafafa;border:1px solid #e5e7eb;border-radius:12px;padding:clamp(16px,3vw,26px);margin-bottom:16px;overflow:hidden;}
.qbg{position:absolute;top:-15px;left:12px;font-size:100px;color:rgba(34,197,94,0.05);font-family:'Syne',sans-serif;font-weight:900;line-height:1;pointer-events:none;}
.qtxt{font-size:clamp(13px,2.5vw,15px);color:#1f2937;line-height:1.85;position:relative;z-index:1;margin-bottom:12px;}
.qatt{font-size:clamp(9px,2vw,11px);color:#9ca3af;font-style:italic;}
.cta{background:linear-gradient(135deg,#050f07,#0a1a0c);border-radius:12px;padding:clamp(20px,4vw,32px);text-align:center;margin-top:20px;border:1px solid rgba(34,197,94,0.15);}
.ctaem{font-size:clamp(28px,5vw,40px);margin-bottom:10px;}
.ctat{font-family:'Syne',sans-serif;font-weight:900;font-size:clamp(18px,4vw,24px);color:#fff;margin-bottom:8px;}
.ctas{font-size:clamp(10px,2vw,12px);color:rgba(134,239,172,0.55);margin-bottom:18px;line-height:1.6;}
.ctach{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;}
.ctach span{background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.25);border-radius:100px;padding:6px 16px;font-size:clamp(9px,2vw,11px);color:#4ade80;font-weight:600;}
</style>
</head>
<body>
<div class="nav"><span class="nav-brand">🦍 APEACADEMY</span><span class="nav-hint">Ctrl+S / ⌘+S to save offline</span></div>
<div class="pages">
<div class="pw"><div class="ptag">Cover Page</div><div class="page cover"><div class="geo"></div><div class="cover-glow"></div><div class="cover-in">
<div class="cover-top"><div class="c-logo"><span class="c-logo-em">🦍</span><span class="c-logo-txt">APEACADEMY</span></div><span class="c-badge">${s(assignment.assignment_type)}</span></div>
<div class="c-eyebrow"><div class="c-eyebrow-line"></div><span class="c-eyebrow-txt">Academic Excellence</span></div>
<div class="c-title">${s(content.doc_title)}</div>
<div class="c-sub">${s((assignment.description || "").substring(0, 140))}${(assignment.description || "").length > 140 ? "…" : ""}</div>
<div class="c-divider"></div>
<div class="c-meta">
<div><div class="mc-l">Student</div><div class="mc-v">${s(assignment.user_name)}</div></div>
<div><div class="mc-l">Course</div><div class="mc-v">${s(assignment.course_name || "N/A")}</div></div>
<div><div class="mc-l">Due Date</div><div class="mc-v">${s(assignment.due_date || "N/A")}</div></div>
</div>
<div class="c-foot"><span class="c-foot-t">Prepared exclusively by ApeAcademy · © 2026</span><span class="c-foot-t">${date}</span></div>
</div></div></div>
<div class="pw"><div class="ptag">Page 2 — Introduction</div><div class="page internal">
<div class="pb"><div class="pgh"><div class="pgh-l"><span class="pgh-em">🦍</span><span class="pgh-br">APEACADEMY</span></div><span class="pgn">02 / 07</span></div>
<div class="sh"><div class="sb"></div><div class="st">Introduction</div></div>${paras(content.introduction)}
<div class="pgft"><span class="pgfl">🦍 APEACADEMY</span><span class="pgfr">For ${s(assignment.user_name)} · ${s(assignment.course_name || "")}</span></div></div>
<div class="rstrip"><div class="sl">Introduction</div></div></div></div>
<div class="pw"><div class="ptag">Page 3 — Concept Explanation</div><div class="page internal">
<div class="pb"><div class="pgh"><div class="pgh-l"><span class="pgh-em">🦍</span><span class="pgh-br">APEACADEMY</span></div><span class="pgn">03 / 07</span></div>
<div class="sh"><div class="sb"></div><div class="st">Concept Explanation</div></div>${paras(content.concept_explanation)}
<div class="kp"><div class="kpd">✓</div><div class="kpt"><strong>KEY POINT:</strong> ${s(content.key_point)}</div></div>
<div class="pgft"><span class="pgfl">🦍 APEACADEMY</span><span class="pgfr">For ${s(assignment.user_name)} · ${s(assignment.course_name || "")}</span></div></div>
<div class="rstrip"><div class="sl">Concepts</div></div></div></div>
<div class="pw"><div class="ptag">Page 4 — Main Analysis</div><div class="page internal">
<div class="pb"><div class="pgh"><div class="pgh-l"><span class="pgh-em">🦍</span><span class="pgh-br">APEACADEMY</span></div><span class="pgn">04 / 07</span></div>
<div class="sh"><div class="sb"></div><div class="st">Solution & Analysis</div></div>${paras(content.main_body)}
<div class="pgft"><span class="pgfl">🦍 APEACADEMY</span><span class="pgfr">For ${s(assignment.user_name)} · ${s(assignment.course_name || "")}</span></div></div>
<div class="rstrip"><div class="sl">Main Body</div></div></div></div>
<div class="pw"><div class="ptag">Page 5 — Deep Understanding</div><div class="page internal">
<div class="pb"><div class="pgh"><div class="pgh-l"><span class="pgh-em">🦍</span><span class="pgh-br">APEACADEMY</span></div><span class="pgn">05 / 07</span></div>
<div class="sh"><div class="sb"></div><div class="st">Deep Understanding</div></div>${paras(content.deep_understanding)}
<div class="en"><div class="ent">🎓 Examiner's Insight</div><div class="end">${s(content.deep_insight)}</div></div>
<div class="pgft"><span class="pgfl">🦍 APEACADEMY</span><span class="pgfr">For ${s(assignment.user_name)} · ${s(assignment.course_name || "")}</span></div></div>
<div class="rstrip"><div class="sl">Deep Dive</div></div></div></div>
<div class="pw"><div class="ptag">Page 6 — Practice, Summary & Glossary</div><div class="page internal">
<div class="pb"><div class="pgh"><div class="pgh-l"><span class="pgh-em">🦍</span><span class="pgh-br">APEACADEMY</span></div><span class="pgn">06 / 07</span></div>
<div class="sh"><div class="sb"></div><div class="st">Practice Questions</div></div>
${(content.practice_questions || []).map((item: any, i: number) => `<div class="qc"><div class="ql">Question 0${i + 1}</div><div class="qt">${s(item.q)}</div><div class="qa"><span class="qal">✓ ANSWER: </span>${s(item.a)}</div></div>`).join('')}
<div class="sh" style="margin-top:26px;"><div class="sb"></div><div class="st">Summary</div></div>
${(content.summary_points || []).map((pt: string) => `<div class="smb"><span class="smem">🦍</span><span class="smt">${s(pt)}</span></div>`).join('')}
<div class="sh" style="margin-top:26px;"><div class="sb"></div><div class="st">Glossary</div></div>
${(content.glossary || []).map((g: any) => `<div class="gi"><span class="gt">${s(g.term)}</span><span class="gd">${s(g.definition)}</span></div>`).join('')}
<div class="pgft"><span class="pgfl">🦍 APEACADEMY</span><span class="pgfr">For ${s(assignment.user_name)} · ${s(assignment.course_name || "")}</span></div></div>
<div class="rstrip"><div class="sl">Practice</div></div></div></div>
<div class="pw"><div class="ptag">Page 7 — Closing</div><div class="page internal">
<div class="pb"><div class="pgh"><div class="pgh-l"><span class="pgh-em">🦍</span><span class="pgh-br">APEACADEMY</span></div><span class="pgn">07 / 07</span></div>
<div class="sh"><div class="sb"></div><div class="st">Quotes to Live By 🔥</div></div>
<div class="qcard"><div class="qbg">"</div><div class="qtxt">"${s(content.quote)}"</div><div class="qatt">— ${s(content.quote_author)}</div></div>
<div class="cta"><div class="ctaem">🦍</div><div class="ctat">Delivered by ApeAcademy</div><div class="ctas">Your academic success is our mission. Questions? One message away.</div><div class="ctach"><span>💬 WhatsApp</span><span>📸 Snapchat</span><span>✉️ Email</span></div></div>
<div class="pgft"><span class="pgfl">🦍 APEACADEMY · © 2026</span><span class="pgfr">Thank you for choosing ApeAcademy</span></div></div>
<div class="rstrip"><div class="sl">Closing</div></div></div></div>
</div></body></html>`;

    const cloudName = Deno.env.get("CLOUDINARY_CLOUD_NAME")!;
    const uploadPreset = Deno.env.get("CLOUDINARY_UPLOAD_PRESET")!;
    const formData = new FormData();
    formData.append("file", new Blob([html], { type: "text/html" }), `${assignment_id}.html`);
    formData.append("upload_preset", uploadPreset);
    formData.append("resource_type", "raw");
    formData.append("public_id", `apeacademy/assignments/${assignment_id}`);
    formData.append("invalidate", "true");

    const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`, { method: "POST", body: formData });
    const cloudData = await cloudRes.json();
    if (!cloudData.secure_url) throw new Error("Cloudinary failed: " + (cloudData.error?.message || JSON.stringify(cloudData)));

    const deliveryUrl = cloudData.secure_url;
    console.log(`🔗 URL: ${deliveryUrl}`);

    const { error: updateError } = await supabase.from("assignments").update({
      delivery_url: deliveryUrl,
      status: "completed",
      updated_at: new Date().toISOString(),
    }).eq("id", assignment_id);
    if (updateError) throw new Error("DB update failed: " + updateError.message);

    await supabase.from("activity_logs").insert({
      action: "assignment_completed",
      details: `Auto-generated for ${assignment.user_name} — ${assignment.assignment_type}`,
      metadata: { assignment_id, delivery_url: deliveryUrl },
    });

    return new Response(JSON.stringify({ success: true, delivery_url: deliveryUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err: any) {
    console.error("❌ generate-and-deliver:", err.message);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
