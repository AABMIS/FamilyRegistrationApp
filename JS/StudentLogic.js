const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxbbV0r7l0BYNDmdkvvOUbBDmHL6E0XBX_7d75jaF2n4TcAYPnj4akUU21Y-nwQFZ2pOg/exec";

let studentCount = 0;
const maxStudents = 10;
let generalData = null;

// ==========================================
// 1️⃣ جلب بيانات رب الأسرة عند تحميل الصفحة
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const storedData = localStorage.getItem("generalData");
    if (!storedData) {
        alert("⚠️ خطأ: بيانات العائلة مفقودة! يرجى العودة للصفحة الأولى لتسجيل العائلة.");
        window.location.href = "index.html";
        return;
    }
    generalData = JSON.parse(storedData);
});

// ==========================================
// 2️⃣ إظهار/إخفاء القسم مع إضافة تلقائية
// ==========================================
function toggleStudent() {
    const choice = document.getElementById("hasStudent").value;
    const section = document.getElementById("studentSection");
    
    if (choice === "yes") {
        section.style.display = "block";
        if (studentCount === 0) addStudent(); // الحركة السحرية لتوفير الوقت
    } else {
        section.style.display = "none";
    }
}

// ==========================================
// 3️⃣ إضافة بطاقة طالب جديدة
// ==========================================
function addStudent() {
    if (studentCount >= maxStudents) {
        alert("⚠️ الحد الأقصى المسموح به 10 طلاب فقط.");
        return;
    }
    studentCount++;

    const container = document.getElementById("studentContainer");
    const div = document.createElement("div");
    div.className = "student-card";
    div.style.border = "2px solid #4CAF50";
    div.style.padding = "20px";
    div.style.marginBottom = "20px";
    div.style.borderRadius = "8px";
    div.style.backgroundColor = "#f1f8e9";

    div.innerHTML = `
        <h3 style="margin-top:0; color:#2e7d32; border-bottom: 2px solid #a5d6a7; padding-bottom: 10px;">🎓 الطالب رقم ${studentCount}</h3>
        
        <label>اسم الطالب رباعي</label>
        <input type="text" class="sName" required placeholder="الاسم رباعي">

        <label>رقم هوية الطالب</label>
        <input type="text" class="sId" placeholder="9 أرقام" inputmode="numeric" required>

        <label>رقم الجوال</label>
        <input type="text" class="sPhone" placeholder="مثال: 0590000000" inputmode="numeric" required>

        <label>الجامعة</label>
        <input type="text" class="sUniv" required placeholder="مثال: الجامعة الإسلامية، جامعة الأزهر...">

        <label>الرقم الجامعي</label>
        <input type="text" class="suId" required placeholder="ادخل الرقم الجامعي">

        <label>التخصص</label>
        <input type="text" class="sMajor" required placeholder="مثال: هندسة برمجيات، طب بشري...">

        <label>المستوى الدراسي</label>
        <select class="sLevel" required>
            <option value="" selected disabled>اختر المستوى</option>
            <option value="دبلوم">دبلوم</option>
            <option value="سنة أولى">سنة أولى</option>
            <option value="سنة ثانية">سنة ثانية</option>
            <option value="سنة ثالثة">سنة ثالثة</option>
            <option value="سنة رابعة">سنة رابعة</option>
            <option value="سنة خامسة">سنة خامسة</option>
            <option value="سنة سادسة">سنة سادسة</option>
            <option value="دراسات عليا">دراسات عليا (ماجستير/دكتوراه)</option>
        </select>

        <button type="button" class="btn-delete" onclick="removeStudent(this)" style="background-color:#ff4d4d; color:white; border:none; padding:8px 15px; border-radius:5px; cursor:pointer; margin-top:15px;">🗑️ حذف الطالب</button>
    `;
    container.appendChild(div);
}

// ==========================================
// 4️⃣ حذف طالب
// ==========================================
function removeStudent(btn) {
    btn.parentElement.remove();
    studentCount--;
}

// ==========================================
// 5️⃣ الفلديشن الصارم والحفظ النهائي
// ==========================================
function saveStudent() {
    if (!generalData || !generalData.husbandId) {
        alert("⚠️ بيانات رب الأسرة مفقودة! لا يمكن الحفظ.");
        return;
    }

    const choice = document.getElementById("hasStudent").value;

    if (choice === "") {
        alert("⚠️ يرجى الإجابة على السؤال: هل يوجد طلاب جامعيين؟");
        document.getElementById("hasStudent").focus();
        return;
    }

    const cards = document.querySelectorAll("#studentContainer > .student-card");
    const students = [];

    // إذا اختار "نعم"، نقوم بعمل فلديشن للبيانات
    if (choice === "yes") {
        if (cards.length === 0) {
            alert("⚠️ اخترت 'نعم' ولكنك لم تضف أي طالب.");
            return;
        }

        const usedIds = new Set();

        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];

            // 1. التحقق من الحقول المطلوبة
            const requiredInputs = card.querySelectorAll("input[required], select[required]");
            for (let input of requiredInputs) {
                if (input.value.trim() === "") {
                    let label = input.previousElementSibling ? input.previousElementSibling.innerText : "هذا الحقل";
                    alert(`في (الطالب رقم ${i + 1}): يرجى تعبئة ${label}`);
                    input.style.border = "2px solid red";
                    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    input.focus();
                    return; 
                } else {
                    input.style.border = "";
                }
            }

            const vName = card.querySelector(".sName").value.trim();
            const idInp = card.querySelector(".sId");
            const vId = idInp.value.trim();
            const phoneInp = card.querySelector(".sPhone");
            const vPhone = phoneInp.value.trim();
            const vUniv = card.querySelector(".sUniv").value.trim();
            const vuId = card.querySelector(".suId").value.trim();
            const vMajor = card.querySelector(".sMajor").value.trim();
            const vLevel = card.querySelector(".sLevel").value;

            // 2. التحقق من رقم الهوية
            if (!/^\d{9}$/.test(vId)) {
                alert(`في (الطالب رقم ${i + 1}): رقم الهوية يجب أن يكون 9 أرقام.`);
                idInp.style.border = "2px solid red";
                idInp.focus();
                return;
            }

            // 3. منع التكرار داخل نفس الفورم
            if (usedIds.has(vId)) {
                alert(`في (الطالب رقم ${i + 1}): رقم الهوية مكرر!`);
                idInp.style.border = "2px solid red";
                idInp.focus();
                return;
            }
            usedIds.add(vId);

            // 4. فحص رقم الجوال
            if (!/^05\d{8}$/.test(vPhone)) {
                alert(`في (الطالب رقم ${i + 1}): رقم الجوال يجب أن يبدأ بـ 05 ويتكون من 10 أرقام.`);
                phoneInp.style.border = "2px solid red";
                phoneInp.focus();
                return;
            }

            // إضافة بيانات الطالب للمصفوفة حسب الهيكلية المتوقعة في السكربت
            students.push({
                name: vName,
                id: vId,
                phone: vPhone,
                uId: vuId,
                major: vMajor,
                level: vLevel,
                univ: vUniv
            });
        }
    }

    // ==========================================
    // 6️⃣ الإرسال للسيرفر (سواء كان هناك طلاب أو لا لإنهاء التسجيل)
    // ==========================================
    const btn = document.getElementById("submitBtn");
    const oldText = btn.innerText;
    btn.innerText = "جاري الحفظ والإنهاء ⏳...";
    btn.disabled = true;

    // إذا اختار "لا"، نرسل مصفوفة فارغة، السكربت الخاص بك مصمم ليتجاهلها ولا يعطي خطأ
    const payload = {
        action: "saveStudent",
        husbandId: generalData.husbandId,
        students: students
    };

    // إذا كان الخيار "لا"، لا داعي للاتصال بالسيرفر لأن السكربت لن يضيف شيئاً أساساً!
    if (choice === "no") {
        finalizeRegistration();
        return;
    }

    fetch(SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "ok") {
            finalizeRegistration();
        } else if (data.status === "error") {
            if (data.msg === "DUPLICATE") {
                alert("⚠️ عذراً، هذا الطالب مسجل مسبقاً في قاعدة البيانات!");
            } else if (data.msg === "FAMILY_NOT_FOUND") {
                alert("❌ خطأ: لم يتم العثور على العائلة الأساسية في قاعدة البيانات.");
            } else {
                alert("❌ خطأ من الخادم: " + data.msg);
            }
            btn.innerText = oldText;
            btn.disabled = false;
        }
    })
    .catch(err => {
        console.error(err);
        alert("❌ حدث خطأ في الاتصال بالسيرفر. يرجى التأكد من الإنترنت والمحاولة.");
        btn.innerText = oldText;
        btn.disabled = false;
    });
}

// ==========================================
// 7️⃣ دالة إنهاء التسجيل (التنظيف والعودة)
// ==========================================
function finalizeRegistration() {
    alert("🎉 تم تسجيل العائلة وكافة التابعين لها بنجاح! سيتم إعادتك للصفحة الرئيسية لتسجيل عائلة جديدة.");
    
    // 🔥 هنا نقوم بمسح البيانات من المتصفح لمنع التداخل في التسجيل القادم
    localStorage.removeItem("generalData");
    
    // العودة للصفحة الأولى (قم بتغيير index.html إذا كان اسم صفحتك الأولى مختلفاً)
    window.location.href = "index.html"; 
}