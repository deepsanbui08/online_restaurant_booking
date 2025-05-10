  const params = new URLSearchParams(window.location.search);
  if (params.has('error')) {
    alert(params.get('error'));
  }
   
  if (params.has('successPasschange')) {
    alert(params.get('successPasschange'));
  }
   if (params.has('successLogOut')) {
    alert(params.get('successLogOut'));
  }
   