import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import { parseMoneyAmount } from "./moneyParse";

function formatMoney(m, currencySymbol) {
  const n = parseMoneyAmount(m);
  if (n == null) return "—";
  return `${currencySymbol}${n.toFixed(2)}`;
}

function lineTotalAmount(item) {
  const q = Number(item.quantity) || 0;
  const unit = parseMoneyAmount(item.price);
  if (unit == null) return null;
  return q * unit;
}

function productLineLabel(item) {
  const p = item?.product_details;
  if (!p) return "—";
  const a = p.category_name ? String(p.category_name).trim() : "";
  const b = p.name ? String(p.name).trim() : "";
  const s = [a, b].filter(Boolean).join(" ");
  return s || "—";
}

function sumLineTotals(order) {
  let s = 0;
  let any = false;
  for (const item of order.order_items || []) {
    const lt = lineTotalAmount(item);
    if (lt != null) {
      s += lt;
      any = true;
    }
  }
  return any ? s : null;
}

/**
 * @param {object} order — stavka iz `order_history` (getUserProfile)
 * @param {object} labels — prevodi + CHECKOUT ključevi za rezime
 */
export function downloadOrderInvoicePdf(order, labels) {
  const sym = order.currency_symbol || "€";
  const ref = order.customer_order_id || `#${order.id}`;
  const dateStr = order.created_at
    ? new Date(order.created_at).toLocaleString()
    : "—";

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 14;
  const tableW = pageW - margin * 2;
  let y = 14;

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(labels.title || "Invoice", margin, y);
  doc.setFont("helvetica", "normal");
  y += 9;

  doc.setFontSize(10);
  doc.text(`${labels.orderRef || "Order"}: ${ref}`, margin, y);
  y += 5.5;
  doc.text(`${labels.date || "Date"}: ${dateStr}`, margin, y);
  y += 5.5;
  doc.text(`${labels.status || "Status"}: ${order.order_status ?? "—"}`, margin, y);
  y += 5.5;
  if (labels.paymentLine) {
    doc.text(labels.paymentLine, margin, y);
    y += 5.5;
  }
  y += 4;

  const addr = order.address_details;
  if (addr) {
    doc.setFont("helvetica", "bold");
    doc.text(labels.shipTo || "Delivery address", margin, y);
    doc.setFont("helvetica", "normal");
    y += 5.5;
    const lines = [
      [addr.street, addr.street_number].filter(Boolean).join(" "),
      [addr.postal_code, addr.city].filter(Boolean).join(" "),
      addr.country,
      addr.phone_number ? `${labels.phone || "Tel"}: ${addr.phone_number}` : null,
    ].filter((line) => line && String(line).trim());
    lines.forEach((line) => {
      doc.text(String(line), margin, y);
      y += 5;
    });
    y += 5;
  }

  const head = [
    [
      labels.colProduct || "Product",
      labels.colAmount || "Amount",
      labels.colPrice || "Price",
      labels.colLineTotal || "Total price",
    ],
  ];

  const body = (order.order_items || []).map((item) => {
    const unit = parseMoneyAmount(item.price);
    const lt = lineTotalAmount(item);
    return [
      productLineLabel(item),
      String(item.quantity ?? "—"),
      unit != null ? formatMoney(item.price, sym) : "—",
      lt != null ? `${sym}${lt.toFixed(2)}` : "—",
    ];
  });

  const colW = [tableW - 22 - 30 - 32, 22, 30, 32].map((w) => Math.max(16, w));
  autoTable(doc, {
    startY: y,
    head,
    body,
    theme: "plain",
    tableWidth: colW.reduce((a, b) => a + b, 0),
    styles: {
      fontSize: 9,
      cellPadding: { top: 3, right: 2, bottom: 3, left: 2 },
      lineColor: [220, 220, 220],
      lineWidth: 0.1,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [245, 247, 250],
      textColor: [40, 40, 40],
      fontStyle: "bold",
      fontSize: 9,
    },
    columnStyles: {
      0: { cellWidth: colW[0], halign: "left" },
      1: { cellWidth: colW[1], halign: "right" },
      2: { cellWidth: colW[2], halign: "right" },
      3: { cellWidth: colW[3], halign: "right" },
    },
    margin: { left: margin, right: margin },
  });

  const tableEnd = doc.lastAutoTable?.finalY ?? y + 50;
  let y2 = tableEnd + 6;

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.4);
  doc.line(margin, y2, pageW - margin, y2);
  y2 += 8;

  const subFromOrder = parseMoneyAmount(order.subtotal);
  const sumLines = sumLineTotals(order);
  const subNum =
    subFromOrder != null ? subFromOrder : sumLines != null ? sumLines : null;
  const subtotalDisplay =
    subNum != null ? `${sym}${subNum.toFixed(2)}` : "—";

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  doc.text(`${labels.subtotal || "Subtotal"}`, margin, y2);
  doc.text(subtotalDisplay, pageW - margin, y2, { align: "right" });
  y2 += 6;

  doc.text(`${labels.shipping || "Shipping"}`, margin, y2);
  doc.text(formatMoney(order.shipping_cost, sym), pageW - margin, y2, {
    align: "right",
  });
  y2 += 6;

  if (labels.vat && labels.vatIncluded) {
    doc.text(`${labels.vat}`, margin, y2);
    doc.text(labels.vatIncluded, pageW - margin, y2, { align: "right" });
    y2 += 6;
  }

  y2 += 2;
  doc.setDrawColor(80, 80, 80);
  doc.setLineWidth(0.5);
  doc.line(margin, y2, pageW - margin, y2);
  y2 += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(20, 20, 20);
  doc.text(labels.totalLabel || "Total", margin, y2);
  doc.text(formatMoney(order.total_price, sym), pageW - margin, y2, {
    align: "right",
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);

  const safeName = String(ref).replace(/[^a-zA-Z0-9-_]/g, "_");
  doc.save(`${labels.filePrefix || "invoice"}-${safeName}.pdf`);
}
