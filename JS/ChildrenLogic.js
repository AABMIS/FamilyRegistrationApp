const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxbbV0r7l0BYNDmdkvvOUbBDmHL6E0XBX_7d75jaF2n4TcAYPnj4akUU21Y-nwQFZ2pOg/exec";

let childCount = 0;
const maxChildren = 15;

let requiredChildrenCount = 0;

document.addEventListener("DOMContentLoaded", () => {
    const storedData = localStorage.getItem("generalData");
    if (!storedData) return;

    const generalData = JSON.parse(storedData);
    const familyCount = parseInt(generalData.familyCount);

    if (!isNaN(familyCount) && familyCount >= 2) {
        requiredChildrenCount = familyCount - 2;
    }
});

// إظهار/إخفاء القسم
function toggleChildren() {
    const choice = document.getElementById("hasChildren").value;

    if (requiredChildrenCount > 0 && choice === "no") {
        alert(`لديك ${requiredChildrenCount} أبناء مسجلين ضمن عدد العائلة. يجب إضافتهم.`);
        document.getElementById("hasChildren").value = "";
        return;
    }

    if (requiredChildrenCount === 0 && choice === "yes") {
        alert("عدد أفراد العائلة لا يحتوي أبناء.");
        document.getElementById("hasChildren").value = "";
        return;
    }

    document.getElementById("childrenSection").style.display =
        (choice === "yes") ? "block" : "none";
}

// إضافة ابن جديد
function addChild() {

    if (childCount >= requiredChildrenCount) {
        alert(`يجب إضافة ${requiredChildrenCount} أبناء فقط.`);
        return;
    }

    childCount++;

    const container = document.getElementById("childrenContainer");
    const div = document.createElement("div");

    // تنسيق البطاقة
    div.className = "child-card";
    div.style.border = "1px solid #ccc";
    div.style.padding = "15px";
    div.style.marginBottom = "15px";
    div.style.borderRadius = "8px";
    div.style.backgroundColor = "#fff";

    div.innerHTML = `
        <h4 style="margin-top:0;">الابن رقم ${childCount}</h4>

        <label>اسم الابن رباعي</label>
        <input type="text" class="childName" required>

        <label>رقم هوية الابن</label>
        <input type="text" class="childId" placeholder="9 أرقام" inputmode="numeric" required>

        <label>جنس الابن</label>
        <select class="childGender" required>
            <option value="ذكر">ذكر</option>
            <option value="أنثى">أنثى</option>
        </select>

        <label>تاريخ الميلاد</label>
        <input type="date" class="childBirth" required>

        <label>هل يعاني من أمراض؟</label>
        <select class="childIll"  required>
          <option value="">اختر</option>
          <option value="لا">لا</option>
          <option value="نعم">نعم</option>
        </select>

        <div class="illnessTypeWrapper" style="display:none;">
          <label>نوع المرض</label>
          <input type="text" class="childIllType">
        </div>

        <button type="button" class="btn-delete" onclick="this.parentElement.remove(); childCount--;" style="background-color:#ff4d4d; margin-top:10px;">🗑️ حذف</button>
    `;
    const illSelect = div.querySelector(".childIll");
    const illWrapper = div.querySelector(".illnessTypeWrapper");
    const illInput = illWrapper.querySelector(".childIllType");

    illSelect.addEventListener("change", () => {
        if (illSelect.value === "نعم") {
            illWrapper.style.display = "block";
            illInput.setAttribute("required", "true");
        } else {
            illWrapper.style.display = "none";
            illInput.removeAttribute("required");
            illInput.value = "";
        }
    });
    container.appendChild(div);
}

// الحفظ والإرسال
function saveAll() {
    // 1. التأكد من وجود البيانات العامة
    const storedData = localStorage.getItem("generalData");
    if (!storedData) {
        alert("⚠️ خطأ: البيانات العامة مفقودة! يرجى العودة للبداية.");
        return;
    }
    const generalData = JSON.parse(storedData);

    if (!/^\d{9}$/.test(generalData.husbandId)) {
        alert("خطأ في بيانات رب الأسرة");
        return;
    }

    const choice = document.getElementById("hasChildren").value;
    const container = document.querySelectorAll("#childrenContainer > div");

    // 2. التحقق من الاختيار
    if (choice === "") {
        alert("⚠️ يرجى تحديد الخيار (نعم / لا) أولاً.");
        return;
    }
    // 3. تجميع البيانات والتحقق من النواقص
    const children = [];
    let isDataIncomplete = false;

    if (choice === "yes") {

        if (container.length === 0) {
            alert("⚠️ اخترت 'نعم' ولكن لم تضف أي ابن.");
            return;
        }

        const usedIds = new Set();

        container.forEach(div => {

            const nameInp = div.querySelector(".childName");
            const idInp = div.querySelector(".childId");
            const genderInp = div.querySelector(".childGender");
            const birthInp = div.querySelector(".childBirth");
            const illInp = div.querySelector(".childIll");
            const illTypeInp = div.querySelector(".childIllType");

            const vName = nameInp.value.trim();
            const vId = idInp.value.trim();
            const vGender = genderInp.value;
            const vBirth = birthInp.value;
            const vIll = illInp.value;
            const vIllType = illTypeInp.value.trim();

            [nameInp, idInp, genderInp, birthInp, illInp, illTypeInp]
                .forEach(el => el.style.border = "1px solid #ccc");

            let hasError = false;

            if (!vName) {
                nameInp.style.border = "1px solid red";
                hasError = true;
            }

            if (!/^\d{9}$/.test(vId)) {
                idInp.style.border = "1px solid red";
                hasError = true;
            }

            if (!vGender) {
                genderInp.style.border = "1px solid red";
                hasError = true;
            }

            if (!vBirth) {
                birthInp.style.border = "1px solid red";
                hasError = true;
            }

            if (!vIll) {
                illInp.style.border = "1px solid red";
                hasError = true;
            }

            if (vIll === "نعم" && !vIllType) {
                illTypeInp.style.border = "1px solid red";
                hasError = true;
            }

            const today = new Date().toISOString().split("T")[0];
            if (vBirth && vBirth > today) {
                birthInp.style.border = "1px solid red";
                hasError = true;
            }

            if (usedIds.has(vId)) {
                idInp.style.border = "1px solid red";
                hasError = true;
            }

            if (hasError) {
                isDataIncomplete = true;
                return;
            }

            usedIds.add(vId);

            children.push({
                name: vName,
                id: vId,
                gender: vGender,
                birth: vBirth,
                ill: vIll,
                illType: vIllType
            });

        });
    }

    if (isDataIncomplete) {
        alert("⚠️ يرجى تعبئة كافة الحقول المطلوبة.");
        return;
    }

    if (choice === "yes" && container.length !== requiredChildrenCount) {
        alert(`يجب إدخال ${requiredChildrenCount} أبناء بالضبط قبل المتابعة.`);
        return;
    }

    // 4. الإرسال
    const btn = document.querySelector(".btn-submit");
    const oldText = btn.innerText;
    btn.innerText = "جاري الحفظ...";
    btn.disabled = true;

    // ملاحظة: نرسل husbandId الموجود في generalData لضمان الربط السليم
    const payload = {
        action: "registerFamily",
        husband: generalData,
        husbandId: generalData.husbandId,
        children: children
    };

    fetch(SCRIPT_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                alert("✅ تم إرسال البيانات بنجاح.");
                window.location.href = "injured.html";
                return;
            }

            btn.innerText = oldText;
            btn.disabled = false;

        })
        .catch(err => {
            console.error(err);
            alert("❌ حدث خطأ أثناء محاولة الإرسال.");
            btn.innerText = oldText;
            btn.disabled = false;
        });
}