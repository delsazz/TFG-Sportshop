export function renderAdminSupplierFragment(target, data = {}) {
  if (!target) return;

  target.innerHTML = 
    <section class="component-fragment" data-component="AdminSupplier">
      <div class="component-fragment__body"></div>
    </section>
  ;

  target.dataset.source = 'version-react-original';
  target.dataset.payload = JSON.stringify(data);
}

