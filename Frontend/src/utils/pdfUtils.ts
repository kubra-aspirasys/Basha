import jsPDF from 'jspdf';
import { Payment } from '@/types';
import { format } from 'date-fns';

const renderReceiptOnPage = (doc: jsPDF, payment: Payment) => {
  const primaryColor = '#F59E0B'; // Amber 500
  const secondaryColor = '#1E293B'; // Slate 800

  // Header
  doc.setFillColor(primaryColor);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor('#FFFFFF');
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('BASHA BIRIYANI', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Premium Biriyani & More', 105, 28, { align: 'center' });

  // Receipt Title
  doc.setTextColor(secondaryColor);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT RECEIPT', 20, 55);

  // Divider
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 60, 190, 60);

  // Transaction Details
  doc.setFontSize(10);
  doc.setTextColor('#64748B');
  doc.text('Transaction ID:', 20, 75);
  doc.setTextColor(secondaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text(payment.transaction_id, 60, 75);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor('#64748B');
  doc.text('Date:', 20, 85);
  doc.setTextColor(secondaryColor);
  doc.text(format(new Date(payment.created_at || payment.createdAt || Date.now()), 'PPP p'), 60, 85);

  doc.setTextColor('#64748B');
  doc.text('Status:', 20, 95);
  doc.setTextColor(payment.status === 'completed' ? '#10B981' : '#F59E0B');
  doc.text(payment.status.toUpperCase(), 60, 95);

  // Customer Section
  doc.setFillColor('#F8FAFC');
  doc.rect(20, 105, 170, 30, 'F');
  
  doc.setTextColor('#64748B');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO:', 25, 115);
  
  doc.setTextColor(secondaryColor);
  doc.setFontSize(12);
  doc.text(payment.customer_name, 25, 125);

  // Payment Summary
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT SUMMARY', 20, 150);
  
  doc.setDrawColor(230, 230, 230);
  doc.line(20, 155, 190, 155);

  const startY = 165;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor('#64748B');
  const headers = ['Items', 'Qty', 'Price', 'Total'];
  doc.text(headers[0], 20, startY);
  doc.text(headers[1], 120, startY);
  doc.text(headers[2], 145, startY);
  doc.text(headers[3], 175, startY);

  doc.line(20, startY + 2, 190, startY + 2);

  let itemY = startY + 10;
  doc.setTextColor(secondaryColor);
  
  const items = payment.order?.items || [];
  
  if (items.length > 0) {
    items.forEach((item) => {
      doc.setFont('helvetica', 'bold');
      doc.text(item.menu_item_name || 'Item', 20, itemY);
      doc.setFont('helvetica', 'normal');
      doc.text(item.quantity.toString(), 122, itemY);
      doc.text(`Rs.${item.price.toLocaleString()}`, 145, itemY);
      doc.text(`Rs.${(item.price * item.quantity).toLocaleString()}`, 175, itemY);
      itemY += 8;
    });
  } else {
    doc.text(payment.order ? `Order #${payment.order.order_number}` : 'Custom Payment', 20, itemY);
    doc.text(`Rs.${payment.amount.toLocaleString()}`, 175, itemY);
    itemY += 8;
  }

  // Totals Breakdown
  let currentY = itemY + 10;
  doc.setFontSize(9);
  doc.setTextColor('#64748B');

  if (payment.order) {
    const order = payment.order as any;
    
    const subtotal = Number(order.subtotal || 0);
    const delivery = Number(order.delivery_charges || 0);
    const gst = Number(order.gst_amount || 0);
    const service = Number(order.service_charges || 0);
    const totalPaid = Number(payment.amount);
    
    const dbDiscount = Number(order.discount_amount || 0);
    const calculatedDiscount = (subtotal + delivery + gst + service) - totalPaid;
    
    // Use DB discount if available, otherwise fallback to calculation if difference is significant (> 1)
    const finalDiscount = dbDiscount || (calculatedDiscount > 1 ? calculatedDiscount : 0);

    if (subtotal) {
      doc.text('Subtotal:', 140, currentY);
      doc.text(`Rs.${subtotal.toLocaleString()}`, 175, currentY);
      currentY += 6;
    }
    
    if (finalDiscount > 0) {
      doc.text('Discount Applied:', 140, currentY);
      doc.setTextColor('#10B981'); // Green
      doc.text(`- Rs.${finalDiscount.toLocaleString()}`, 175, currentY);
      doc.setTextColor('#64748B');
      currentY += 6;
    }
    if (order.delivery_charges > 0) {
      doc.text('Delivery Charges:', 140, currentY);
      doc.text(`Rs.${Number(order.delivery_charges).toLocaleString()}`, 175, currentY);
      currentY += 6;
    }
    if (order.gst_amount > 0) {
      doc.text('GST / Taxes:', 140, currentY);
      doc.text(`Rs.${Number(order.gst_amount).toLocaleString()}`, 175, currentY);
      currentY += 6;
    }
  }

  // Total Section
  const totalY = Math.max(currentY + 5, 200);
  doc.setFillColor('#F1F5F9');
  doc.rect(130, totalY, 60, 20, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(secondaryColor);
  doc.text('TOTAL PAID', 135, totalY + 13);
  doc.setFontSize(11);
  doc.text(`Rs.${payment.amount.toLocaleString()}`, 165, totalY + 13);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor('#94A3B8');
  doc.setFont('helvetica', 'normal');
  doc.text('This is a computer-generated receipt and does not require a signature.', 105, 270, { align: 'center' });
  doc.text('www.bashafood.in', 105, 275, { align: 'center' });
};

export const generateReceiptPDF = (payment: Payment) => {
  const doc = new jsPDF();
  renderReceiptOnPage(doc, payment);
  doc.save(`Receipt_${payment.transaction_id}.pdf`);
};

export const generateBulkReceiptsPDF = (payments: Payment[]) => {
  const doc = new jsPDF();
  payments.forEach((payment, index) => {
    if (index > 0) {
      doc.addPage();
    }
    renderReceiptOnPage(doc, payment);
  });
  
  const timestamp = format(new Date(), 'yyyyMMdd_HHmm');
  doc.save(`Bulk_Receipts_${timestamp}.pdf`);
};
