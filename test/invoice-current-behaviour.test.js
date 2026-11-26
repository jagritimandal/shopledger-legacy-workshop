'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const invoice = require('../lib/invoice');
const pricing = require('../lib/pricing');

function orderWith(item, coupon) {
  return {
    id: 1,
    coupon: coupon || '',
    items: [item]
  };
}

test('invoice totals and GST breakdown match the billed order', function () {
  const item = {
    id: 1,
    name: 'Rice',
    sku: 'GRN-001',
    hsn: '1006',
    price: 640,
    qty: 1
  };

  const billed = pricing.computeTotals([item], '');
  const order = orderWith(item, '');
  const printed = invoice.computeInvoiceFigures(order);

  assert.deepEqual(
    {
      subtotal: printed.subtotal,
      discount: printed.discount,
      tax: printed.tax,
      cgst: printed.cgst,
      sgst: printed.sgst,
      total: printed.total
    },
    {
      subtotal: billed.subtotal,
      discount: billed.discount,
      tax: billed.tax,
      cgst: billed.cgst,
      sgst: billed.sgst,
      total: billed.total
    }
  );

  const html = invoice.render(order);
  assert.match(html, /Total GST\)<\/td><td class="r">[^<]*32\.00/);
  assert.match(html, /Invoice Total<\/td><td class="r">[^<]*672\.00/);
});

test('invoice uses the HSN slab shown on the order line', function () {
  const item = {
    id: 1,
    name: 'Rice',
    sku: 'GRN-001',
    hsn: '1006',
    price: 100,
    qty: 1
  };

  const billed = pricing.computeTotals([item], '');
  const printed = invoice.computeInvoiceFigures(orderWith(item, ''));

  assert.equal(billed.tax, 5);
  assert.equal(printed.tax, billed.tax);
  assert.equal(printed.total, billed.total);
  assert.equal(printed.rows[0].gstPercent, 5);
});

test('invoice applies a percent coupon to subtotal and calculates GST after discount', function () {
  const item = {
    id: 2,
    name: 'Tea',
    sku: 'BEV-001',
    hsn: '0902',
    price: 1000,
    qty: 1
  };

  const billed = pricing.computeTotals([item], 'SAVE10');
  const printed = invoice.computeInvoiceFigures(orderWith(item, 'SAVE10'));

  assert.equal(billed.discount, 100);
  assert.equal(billed.tax, 162);
  assert.equal(billed.total, 1062);
  assert.equal(printed.discount, billed.discount);
  assert.equal(printed.tax, billed.tax);
  assert.equal(printed.total, billed.total);
  assert.equal(printed.rows[0].lineTax, billed.lines[0].tax);
});

test('invoice respects the configured percent coupon maximum discount', function () {
  const item = {
    id: 3,
    name: 'Tea',
    sku: 'BEV-001',
    hsn: '0902',
    price: 1000,
    qty: 2
  };

  const billed = pricing.computeTotals([item], 'SAVE10');
  const printed = invoice.computeInvoiceFigures(orderWith(item, 'SAVE10'));

  assert.equal(billed.discount, 150);
  assert.equal(printed.discount, billed.discount);
  assert.equal(printed.tax, billed.tax);
  assert.equal(printed.total, billed.total);
  assert.equal(printed.cgst, billed.cgst);
  assert.equal(printed.sgst, billed.sgst);
});

test('invoice line tax uses the discounted taxable amount', function () {
  const item = {
    id: 4,
    name: 'Tea',
    sku: 'BEV-001',
    hsn: '0902',
    price: 1000,
    qty: 1
  };

  const billed = pricing.computeTotals([item], 'SAVE10');
  const printed = invoice.computeInvoiceFigures(orderWith(item, 'SAVE10'));

  assert.equal(billed.lines[0].taxable, 900);
  assert.equal(billed.lines[0].tax, 162);
  assert.equal(printed.rows[0].line, 1000);
  assert.equal(printed.rows[0].lineTax, billed.lines[0].tax);
});
