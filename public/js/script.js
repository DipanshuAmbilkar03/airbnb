(() => {
    'use strict'
  
    const forms = document.querySelectorAll('.needs-validation')
  
    Array.from(forms).forEach(form => {
      form.addEventListener('submit', event => {
        if (!form.checkValidity()) {
          event.preventDefault()
          event.stopPropagation()
        }
  
        form.classList.add('was-validated')
      }, false)
    })

    const taxSwitch = document.getElementById("flexSwitchCheckDefault");
    if (taxSwitch) {
      taxSwitch.addEventListener("change", () => {
        const taxInfoItems = document.querySelectorAll(".tax-info");
        taxInfoItems.forEach((taxInfo) => {
          taxInfo.classList.toggle("tax-info--visible", taxSwitch.checked);
        });
      });
    }
  })()
