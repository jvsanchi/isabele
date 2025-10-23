let nomeCliente = '';
function atualizarNomeCliente() {
  const campo = document.getElementById('campoCliente');
  nomeCliente = campo.value;
  document.getElementById('resumoCliente').textContent = nomeCliente.match(/.{1,25}/g)?.join('\n') || '';
}

let nomeAC = '';
function atualizarNomeAC() {
  const campo = document.getElementById('campoAC');
  nomeAC = campo.value;
  document.getElementById('resumoAC').textContent = nomeAC.match(/.{1,25}/g)?.join('\n') || '';
}

document.getElementById('add-linha').addEventListener('click', function () {
  const tbody = document.getElementById('corpo-tabela');
  const novaLinha = document.createElement('tr');

  for (let i = 0; i < 6; i++) {
    const td = document.createElement('td');
    td.style = "position: relative; display: table-cell; vertical-align: middle; padding: 0 4px;";

    if (i === 4 || i === 5) {
      const span = document.createElement('span');
      span.innerText = "R$ ";
      span.style = "font-weight: bold; margin-right: 2px; vertical-align: middle;";

      const textarea = document.createElement('textarea');
      textarea.setAttribute('oninput', 'autoResize(this)');
      textarea.style = "width: calc(100% - 30px); border: none; outline: none; font-family: 'Sora'; font-size: 14px; box-sizing: border-box; resize: none; overflow: hidden; text-align: right; margin-left: 4px; display: inline-block; vertical-align: middle; padding: 0; margin: 0; padding-top: 6px; line-height: 1.4;";

      td.appendChild(span);
      td.appendChild(textarea);
    } else {
      const textarea = document.createElement('textarea');
      textarea.setAttribute('oninput', 'autoResize(this)');
      textarea.style = "width: 100%; border: none; outline: none; font-family: 'Sora'; font-size: 14px; box-sizing: border-box; resize: none; overflow: hidden; text-align: center; margin: 0; display: inline-block; vertical-align: middle; padding-top: 6px; line-height: 1.4;";
      td.appendChild(textarea);
    }

    novaLinha.appendChild(td);
  }

  tbody.appendChild(novaLinha);
  aplicarListenersDeCalculo(novaLinha);
});

document.getElementById('remove-linha').addEventListener('click', function () {
  const tbody = document.getElementById('corpo-tabela');
  const linhas = tbody.querySelectorAll('tr');

  if (linhas.length > 1) {
    tbody.removeChild(linhas[linhas.length - 1]);
    atualizarSubtotal();
  }
});

function atualizarSubtotal() {
  let soma = 0;
  const linhas = document.querySelectorAll('#corpo-tabela tr');

  linhas.forEach(tr => {
    const campoTotal = tr.cells[5]?.querySelector('textarea');
    if (campoTotal) {
      const valor = limparMascara(campoTotal.value);
      if (!isNaN(valor)) {
        soma += valor;
      }
    }
  });

  const campoSubtotal = document.querySelector('.totals tr:nth-child(1) input');
  if (campoSubtotal) {
    campoSubtotal.value = formatarMoeda(soma);
  }

  atualizarTaxaEDesconto();
  atualizarTotalFinal();
}

function atualizarTaxaEDesconto() {
  const subtotalInput = document.querySelector('.totals tr:nth-child(1) input');
  const valorSubtotal = limparMascara(subtotalInput?.value || "0");

  const checkboxTaxa = document.getElementById('checkbox-taxa');
  const campoTaxa = document.getElementById('campo-taxa');
  if (checkboxTaxa?.checked) {
    campoTaxa.value = formatarMoeda(valorSubtotal * 0.12);
  } else {
    campoTaxa.value = "";
  }

  const checkboxDesconto = document.getElementById('checkbox-desconto');
  const campoDesconto = document.getElementById('campo-desconto');
  if (checkboxDesconto?.checked) {
    campoDesconto.value = "-" + formatarMoeda(valorSubtotal * 0.10);
  } else {
    campoDesconto.value = "";
  }

  atualizarTotalFinal();
}

document.getElementById('checkbox-taxa')?.addEventListener('change', atualizarTaxaEDesconto);
document.getElementById('checkbox-desconto')?.addEventListener('change', atualizarTaxaEDesconto);

function atualizarTotalFinal() {
  const subtotal = limparMascara(document.getElementById('campo-subtotal')?.value || "0");
  const taxa = limparMascara(document.getElementById('campo-taxa')?.value || "0");
  const desconto = limparMascara(document.getElementById('campo-desconto')?.value || "0");

  const valorFinal = subtotal + taxa + desconto;
  document.getElementById('campo-total').value = formatarMoeda(valorFinal);
}

function atualizarValorTotalDaLinha(tr) {
  const qtd = parseFloat(tr.cells[0].querySelector('textarea')?.value.replace(',', '.') || 0);
  const hora = parseFloat(tr.cells[2].querySelector('textarea')?.value.replace(',', '.') || 0);
  const valorHoraTexto = tr.cells[4].querySelector('textarea')?.value.replace(',', '.').replace('R$', '').trim() || "0";
  const valorHora = parseFloat(valorHoraTexto);
  const resultado = qtd * hora * valorHora;

  const totalTextarea = tr.cells[5].querySelector('textarea');
  if (totalTextarea) {
    totalTextarea.value = formatarMoeda(isNaN(resultado) ? 0 : resultado);
  }

  atualizarSubtotal();
}

function aplicarListenersDeCalculo(tr) {
  const camposParaCalcular = [0, 2, 4];

  camposParaCalcular.forEach((colIndex) => {
    const textarea = tr.cells[colIndex].querySelector('textarea');
    if (textarea) {
      textarea.addEventListener('input', () => atualizarValorTotalDaLinha(tr));
    }
  });
}

document.querySelectorAll('#corpo-tabela tr').forEach(tr => aplicarListenersDeCalculo(tr));

function formatarMoeda(valor) {
  return " " + valor.toFixed(2).replace('.', ',');
}

function limparMascara(valor) {
  if (!valor) return 0;
  return parseFloat(
    valor
      .replace('R$', '')
      .replace(/\s/g, '')
      .replace('-', '-')
      .replace(/\./g, '')
      .replace(',', '.')
  ) || 0;
}

function autoResize(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = (textarea.scrollHeight) + 'px';
}

function exportarPDF() {
  window.print();
}

function adicionarTermo() {
  const container = document.querySelector('h3').parentNode;
  const termos = container.querySelectorAll('.linha-termo');
  const numero = termos.length + 1;

  const linha = document.createElement('div');
  linha.classList.add('linha-termo');
  linha.style = 'display: flex; align-items: flex-start; gap: 6px; margin-bottom: 4px;';

  const numeroSpan = document.createElement('span');
  numeroSpan.innerText = numero + '.';
  numeroSpan.style = 'font-weight: bold; font-size: 14px; min-width: 20px;';

  const texto = document.createElement('textarea');
  texto.classList.add('termo-dinamico');
  texto.rows = 1;
  texto.setAttribute('oninput', 'autoResize(this)');
  texto.style = 'flex: 1; width: 100%; border: none; outline: none; font-size: 14px; resize: none; overflow: hidden; line-height: 1.4;';

  linha.appendChild(numeroSpan);
  linha.appendChild(texto);

  container.insertBefore(linha, container.querySelector('button'));
}

function removerTermo() {
  const container = document.querySelector('h3').parentNode;
  const termos = container.querySelectorAll('.linha-termo');

  if (termos.length > 1) {
    container.removeChild(termos[termos.length - 1]);
  }
}

