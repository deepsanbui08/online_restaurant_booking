document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.register-form');

    form.addEventListener('submit', function (e) {
        const email = document.getElementById('email').value.trim();
        const mobile = document.getElementById('mobile').value.trim();
        const aadhar = document.getElementById('aadharNumber').value.trim();
        const dob = document.getElementById('dob').value;

        if (!isValidEmail(email)) {
            alert("Invalid email format.");
            e.preventDefault();
            return;
        }

        if (!isValidMobile(mobile)) {
            alert("Invalid mobile number. Must be a 10-digit Indian number starting with 6-9.");
            e.preventDefault();
            return;
        }

        if (!isValidAadhar(aadhar)) {
            alert("Invalid Aadhar number. Must be exactly 12 digits.");
            e.preventDefault();
            return;
        }

        if (!isValidDOB(dob)) {
            alert("You must be at least 18 years old.");
            e.preventDefault();
            return;
        }
    });

    function isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    function isValidMobile(mobile) {
        const regex = /^[6-9]\d{9}$/;
        return regex.test(mobile);
    }

    function isValidAadhar(aadhar) {
        const regex = /^\d{12}$/;
        return regex.test(aadhar);
    }

    function isValidDOB(dob) {
        const birthDate = new Date(dob);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const dayDiff = today.getDate() - birthDate.getDate();
        return (
            age > 18 || (age === 18 && (monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0)))
        );
    }
});
  const params = new URLSearchParams(window.location.search);
  if (params.has('errorEmail')) {
    alert(params.get('errorEmail'));
  }
   if (params.has('errorOtp')) {
    alert(params.get('errorOtp'));
  }
   if (params.has('errorIncorrectOtp')) {
    alert(params.get('errorIncorrectOtp'));
  }
