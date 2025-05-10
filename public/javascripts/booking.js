
  // Set today's date as minimum
  const dateInput = document.getElementById('date');
  const today = new Date().toISOString().split('T')[0];
  dateInput.setAttribute('min', today);

  // Validate on change
  dateInput.addEventListener('change', function () {
    const selectedDate = this.value;
    if (selectedDate < today) {
      alert('Please select a valid booking date (today or future date).');
      this.value = ''; // Clear invalid input
    }
  });

