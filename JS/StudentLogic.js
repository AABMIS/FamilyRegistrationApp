// ⚠️ تأكد من وضع الرابط الجديد هنا
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzMsMmEoxviek7_7CE75m50mqcn7YMHWHMpYdSr9HPVE2RxW5nnWDFtrDt4oJDTovwo6g/exec"; 

let studentCount = 0;
const maxStudents = 10;

// إظهار/إخفاء القسم
function toggleStudent() {
    const choice = document.getElementById("hasStudent").value;
    document.getElementById("studentSection").style.display = (choice === "yes") ? "block" : "none";
}

// إضافة طالب جديد
function addStudent() {
    if (studentCount >= maxStudents) {
        alert("الحد الأقصى 10 طلاب فقط");
        return;
    }
    studentCount++;

    const container = document.getElementById("studentContainer");
    const div = document.createElement("div");
    
    // تنسيق البطاقة
    div.style.border = "1px solid #ccc";
    div.style.padding = "15px";
    div.style.marginBottom = "15px";
    div.style.borderRadius = "8px";
    div.style.backgroundColor = "#fdfdfd";

    div.innerHTML = `
        <h4 style="margin-top:0;">الطالب رقم ${studentCount}</h4>
        
        <label>اسم الطالب رباعي</label>
        <input type="text" class="sName" placeholder="الاسم كما في الهوية" required>

        <label>رقم الهوية</label>
        <input type="number" class="sId" placeholder="9 أرقام" required>

        <label>رقم الجوال</label>
        <input type="number" class="sPhone" placeholder="رقم للتواصل" required>

        <label>الرقم الجامعي</label>
        <input type="text" class="sUnivId" required>

        <label>التخصص</label>
        <input type="text" class="sMajor" required>

        <label>المستوى الدراسي</label>
        <select class="sLevel" required>
            <option value="">اختر</option>
            <option>سنة أولى</option>
            <option>سنة ثانية</option>
            <option>سنة ثالثة</option>
            <option>سنة رابعة</option>
            <option>سنة خامسة</option>
            <option>ماجستير/دكتوراه</option>
        </select>

        <label>اسم الجامعة</label>
        <input type="text" class="sUnivName" required>
        
        <button type="button" class="btn-delete" onclick="this.parentElement.remove(); studentCount--;" style="background-color:#ff4d4d; margin-top:10px;">🗑️ حذف</button>
    `;
    container.appendChild(div);
}

// دالة الحفظ النهائي
function saveStudent() {
    // 1. جلب البيانات العامة بشكل صحيح ✅
    const rawData = localStorage.getItem("generalData");
    if (!rawData) {
        alert("⚠️ خطأ: بيانات التسجيل مفقودة! يرجى البدء من جديد.");
        return;
    }
    const generalData = JSON.parse(rawData);

    const choice = document.getElementById("hasStudent").value;
    const container = document.querySelectorAll("#studentContainer > div");

    // 2. التحقق من القائمة
    if (choice === "") {
        alert("⚠️ يرجى تحديد الخيار (نعم / لا) أولاً.");
        return;
    }

    // 3. إذا اختار "لا" -> إنهاء فوري
    if (choice === "no") {
        finishRegistration();
        return;
    }

    // 4. إذا اختار "نعم" ولم يضف
    if (choice === "yes" && container.length === 0) {
        alert("⚠️ اخترت 'نعم' ولكن لم تضف أي طالب.");
        return;
    }

    // 5. تجميع البيانات وفحص النواقص
    const students = [];
    let isDataIncomplete = false;

    container.forEach(div => {
        const nameInp = div.querySelector(".sName");
        const idInp = div.querySelector(".sId");
        const phoneInp = div.querySelector(".sPhone");
        const uIdInp = div.querySelector(".sUnivId");
        const majorInp = div.querySelector(".sMajor");
        const levelInp = div.querySelector(".sLevel");
        const univInp = div.querySelector(".sUnivName");

        const valName = nameInp.value.trim();
        const valId = idInp.value.trim();
        const valPhone = phoneInp.value.trim();
        const valUId = uIdInp.value.trim();
        const valMajor = majorInp.value.trim();
        const valLevel = levelInp.value;
        const valUniv = univInp.value.trim();

        // تنظيف الألوان
        [nameInp, idInp, phoneInp, uIdInp, majorInp, levelInp, univInp].forEach(el => el.style.border = "1px solid #ccc");

        if (!valName || !valId || !valPhone || !valUId || !valMajor || !valLevel || !valUniv) {
            isDataIncomplete = true;
            if (!valName) nameInp.style.border = "1px solid red";
            // ... يمكنك تلوين الباقي بنفس الطريقة
        }

        students.push({
            name: valName,
            id: valId,
            phone: valPhone,
            uId: valUId,
            major: valMajor,
            level: valLevel,
            univ: valUniv
        });
    });

    if (isDataIncomplete) {
        alert("⚠️ يرجى تعبئة كافة حقول بيانات الطلاب.");
        return;
    }

    // 6. الإرسال
    const btn = document.querySelector(".btn-submit");
    const oldText = btn.innerText;
    btn.innerText = "جاري الحفظ والإنهاء...";
    btn.disabled = true;

    const payload = {
        action: "saveStudent",
        husbandName: generalData.husbandName, // ✅ نرسل الاسم ليحفظه السكربت في العمود B
        husbandId: generalData.husbandId,     // ✅ نرسل الهوية ليحفظها السكربت في العمود C
        students: students
    };

    fetch(SCRIPT_URL, { 
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify(payload)
    })
    .then(() => {
        finishRegistration();
    })
    .catch(err => {
        alert("خطأ في الاتصال");
        btn.innerText = oldText;
        btn.disabled = false;
    });
}

// دالة الإنهاء وتنظيف الذاكرة
function finishRegistration() {
    alert("✅ تم تسجيل العائلة بنجاح!\nشكراً لتعاونكم.");
    localStorage.clear(); // 🧹 تنظيف الذاكرة بالكامل
    window.location.href = "index.html"; // العودة للصفحة الرئيسية
}