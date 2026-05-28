export function renderAdminReturnsFragment(target, data = {}) {
  if (!target) return;

  target.innerHTML = `
    <section class="component-fragment" data-component="AdminReturns">
      <div class="component-fragment__body"></div>
    </section>`
  ;

  target.dataset.source = 'version-react-original';
  target.dataset.payload = JSON.stringify(data);
}

