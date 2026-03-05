const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxbbV0r7l0BYNDmdkvvOUbBDmHL6E0XBX_7d75jaF2n4TcAYPnj4akUU21Y-nwQFZ2pOg/exec";

let generalData = null;
let requiredChildrenCount = 0;

// ==========================================
// 1️⃣ عند تحميل الصفحة: الحركة السحرية لتوليد الأبناء
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const storedData = localStorage.getItem("generalData");
    
    // إذا لم تكن هناك بيانات، أعده للصفحة الأولى
    if (!storedData) {
        alert("⚠️ البيانات العامة مفقودة! يرجى تعبئة الصفحة الأولى أولاً.");
        window.location.href = "index.html";
        return;
    }

    generalData = JSON.parse(storedData);
    const familyCount = parseInt(generalData.familyCount) || 0;
    
    // حساب عدد الأبناء المطلوب (العدد الكلي - الزوجين)
    requiredChildrenCount = familyCount - 2;

    const container = document.getElementById("childrenContainer");
    const noChildrenMsg = document.getElementById("noChildrenMessage");

    if (requiredChildrenCount > 0) {
        // توليد النماذج بعدد الأبناء
        for (let i = 1; i <= requiredChildrenCount; i++) {
            createChildCard(i, container);
        }
    } else {
        // إذا كان العدد 0 أو أقل، إخفاء الحاوية وإظهار رسالة لطيفة
        container.style.display = "none";
        noChildrenMsg.style.display = "block";
    }
});

// ==========================================
// 2️⃣ دالة توليد بطاقة الابن (HTML ديناميكي)
// ==========================================
function createChildCard(index, container) {
    const div = document.createElement("div");
    div.className = "child-card";
    div.style.border = "2px solid #ddd";
    div.style.padding = "20px";
    div.style.marginBottom = "20px";
    div.style.borderRadius = "8px";
    div.style.backgroundColor = "#fafafa";

    div.innerHTML = `
        <h3 style="margin-top:0; color:#333; border-bottom: 2px solid #ccc; padding-bottom: 10px;">👤 بيانات الابن رقم ${index}</h3>

        <label>اسم الابن رباعي</label>
        <input type="text" class="childName" required placeholder="ادخل اسم الابن رباعي">

        <label>رقم هوية الابن</label>
        <input type="text" class="childId" placeholder="9 أرقام" inputmode="numeric" required>

        <label>جنس الابن</label>
        <select class="childGender" required>
            <option value="" selected disabled>اختر</option>
            <option value="ذكر">ذكر</option>
            <option value="أنثى">أنثى</option>
        </select>

        <label>تاريخ الميلاد</label>
        <input type="date" class="childBirth" required>

        <label>هل يعاني من أمراض مزمنة أو إعاقة؟</label>
        <select class="childIll" required onchange="toggleChildIllness(this)">
            <option value="" selected disabled>اختر</option>
            <option value="لا">لا</option>
            <option value="نعم">نعم</option>
        </select>

        <div class="illnessTypeWrapper" style="display:none; margin-top: 10px;">
            <label>نوع المرض (إجباري إذا اخترت نعم)</label>
            <input type="text" class="childIllType" disabled>
        </div>
    `;
    container.appendChild(div);
}

// ==========================================
// 3️⃣ تفعيل/إلغاء حقل المرض الخاص بكل ابن ديناميكياً
// ==========================================
function toggleChildIllness(selectEl) {
    // نبحث عن أقرب بطاقة ابن (child-card) لتعديل حقل المرض الخاص بها فقط
    const card = selectEl.closest('.child-card');
    const wrapper = card.querySelector('.illnessTypeWrapper');
    const inputEl = card.querySelector('.childIllType');

    if (selectEl.value === "نعم") {
        wrapper.style.display = "block";
        inputEl.disabled = false;
        inputEl.required = true;
        inputEl.focus();
    } else {
        wrapper.style.display = "none";
        inputEl.disabled = true;
        inputEl.required = false;
        inputEl.value = "";
        inputEl.style.border = "";
    }
}

// ==========================================
// 4️⃣ الفلديشن الصارم وحفظ وإرسال البيانات
// ==========================================
function saveAll() {
    // 1. فحص توفر البيانات العامة
    if (!generalData) {
        alert("⚠️ خطأ: البيانات العامة مفقودة! سيتم إعادتك للبداية.");
        window.location.href = "index.html";
        return;
    }

    const children = [];
    const usedIds = new Set();
    const today = new Date().toISOString().split("T")[0];
    
    // إضافة هوية الأب والأم للمجموعة لمنع الابن من استخدام نفس الهوية!
    usedIds.add(generalData.husbandId);
    usedIds.add(generalData.wifeId);

    // 2. إذا كان هناك أبناء، نقوم بالفلديشن الصارم عليهم
    if (requiredChildrenCount > 0) {
        const cards = document.querySelectorAll(".child-card");

        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];
            
            // جلب الحقول المطلوبة داخل البطاقة الحالية
            const requiredInputs = card.querySelectorAll("input[required], select[required]");
            
            for (let input of requiredInputs) {
                if (input.value.trim() === "") {
                    let label = input.previousElementSibling ? input.previousElementSibling.innerText : "هذا الحقل";
                    alert(`في (الابن رقم ${i + 1}): يرجى تعبئة ${label}`);
                    input.style.border = "2px solid red";
                    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    input.focus();
                    return; // إيقاف العملية فوراً
                } else {
                    input.style.border = "";
                }
            }

            // جلب قيم الحقول للابن
            const vName = card.querySelector(".childName").value.trim();
            const idInp = card.querySelector(".childId");
            const vId = idInp.value.trim();
            const vGender = card.querySelector(".childGender").value;
            const birthInp = card.querySelector(".childBirth");
            const vBirth = birthInp.value;
            const vIll = card.querySelector(".childIll").value;
            const vIllType = card.querySelector(".childIllType").value.trim();

            // فحص صحة رقم الهوية (9 أرقام)
            if (!/^\d{9}$/.test(vId)) {
                alert(`في (الابن رقم ${i + 1}): رقم الهوية غير صحيح، يجب أن يتكون من 9 أرقام.`);
                idInp.style.border = "2px solid red";
                idInp.focus();
                return;
            }

            // فحص عدم تكرار الهوية (سواء مع الأبناء أو الأبوين)
            if (usedIds.has(vId)) {
                alert(`في (الابن رقم ${i + 1}): رقم الهوية ${vId} مكرر! تم استخدامه مسبقاً لابن آخر أو للأبوين.`);
                idInp.style.border = "2px solid red";
                idInp.focus();
                return;
            }
            usedIds.add(vId);

            // فحص تاريخ الميلاد (ليس في المستقبل)
            if (vBirth > today) {
                alert(`في (الابن رقم ${i + 1}): تاريخ الميلاد لا يمكن أن يكون في المستقبل.`);
                birthInp.style.border = "2px solid red";
                birthInp.focus();
                return;
            }

            // إضافة بيانات الابن للمصفوفة
            children.push({
                name: vName,
                id: vId,
                gender: vGender,
                birth: vBirth,
                ill: vIll,
                illType: vIllType
            });
        }
    }

    // =========================================================
    // 3. كل شيء سليم 100% -> إرسال البيانات (Form 1 + Form 2)
    // =========================================================
    const btn = document.getElementById("submitBtn");
    const oldText = btn.innerText;
    btn.innerText = "جاري الحفظ في قاعدة البيانات ⏳...";
    btn.disabled = true;

    // تجهيز حزمة البيانات (Payload) حسب هيكلية السكربت الخاص بك
    const payload = {
        action: "registerFamily",
        husbandId: generalData.husbandId,
        husband: generalData,
        children: children
    };

    fetch(SCRIPT_URL, {
        method: "POST",
        headers: {
            "Content-Type": "text/plain;charset=utf-8" // استخدام text/plain لمنع مشاكل CORS أحياناً في Apps Script
        },
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
        // بناءً على السكربت الخاص بك، النجاح يرجع { status: "ok" }
        if (data.status === "ok") {
            alert("✅ تم حفظ بيانات العائلة والأبناء بنجاح!");
            // الانتقال للصفحة التالية
            window.location.href = "injured.html"; 
        } else if (data.status === "exists") {
            alert("⚠️ عذراً، هذه العائلة (هذا الزوج) مسجلة مسبقاً في قاعدة البيانات!");
            btn.innerText = oldText;
            btn.disabled = false;
        } else {
            alert("❌ حدث خطأ من الخادم: " + (data.msg || "غير معروف"));
            btn.innerText = oldText;
            btn.disabled = false;
        }
    })
    .catch(err => {
        console.error(err);
        alert("❌ حدث خطأ في الاتصال بالخادم. يرجى التأكد من الإنترنت والمحاولة مرة أخرى.");
        btn.innerText = oldText;
        btn.disabled = false;
    });
}