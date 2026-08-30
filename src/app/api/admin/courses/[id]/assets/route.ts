import { createClient } from "@/lib/supabase/server";
import { getDashboardIdentity } from "@/lib/auth";

const bucket = "course-assets";
const maxSize = 5 * 1024 * 1024;
const extensions: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };


export async function POST(request: Request, context: RouteContext<"/api/admin/courses/[id]/assets">) {
  const identity = await getDashboardIdentity();
  if (!identity) return Response.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  if (!id || id === "new") return Response.json({ message: "Course not found." }, { status: 400 });

  const formData = await request.formData();
  const file = formData.get("file");
  const kind = formData.get("kind");
  if (!(file instanceof File) || !(kind === "cover" || kind === "instructor")) {
    return Response.json({ message: "اختر صورة صحيحة." }, { status: 422 });
  }
  if (!extensions[file.type]) return Response.json({ message: "يسمح فقط بصور PNG أو JPG أو WebP." }, { status: 422 });
  if (file.size > maxSize) return Response.json({ message: "حجم الصورة يجب ألا يتجاوز 5MB." }, { status: 422 });

  const supabase = await createClient();
  const { data: course, error: courseError } = await supabase.from("courses").select("id,instructor_id").eq("id", id).maybeSingle();
  if (courseError || !course) return Response.json({ message: "Course not found." }, { status: 404 });
  if (kind === "instructor" && !course.instructor_id) return Response.json({ message: "لا يوجد محاضر مرتبط بهذه الدورة." }, { status: 422 });

  const path = `${id}/${kind}-${crypto.randomUUID()}.${extensions[file.type]}`;
  const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type, cacheControl: "3600", upsert: false });
  if (uploadError) return Response.json({ message: "تعذر رفع الصورة. تأكد من إعداد مساحة التخزين course-assets." }, { status: 500 });

  const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(path);
  const publicUrl = publicData.publicUrl;
  const updateResult = kind === "cover"
    ? await supabase.from("courses").update({ cover_path: publicUrl, updated_at: new Date().toISOString() }).eq("id", id)
    : await supabase.from("instructors").update({ photo_path: publicUrl, updated_at: new Date().toISOString() }).eq("id", course.instructor_id);
  if (updateResult.error) {
    await supabase.storage.from(bucket).remove([path]);
    return Response.json({ message: "تعذر حفظ رابط الصورة." }, { status: 500 });
  }

  return Response.json({ ok: true, url: publicUrl });
}