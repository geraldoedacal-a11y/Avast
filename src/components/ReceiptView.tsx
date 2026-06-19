import React, { useState } from 'react';
import { PrintJob, PaymentDetails, ReceiptInfo } from '../types';
import { CheckCircle, Printer, Download, Copy, Split, Check, Bookmark, MapPin, PhoneCall } from 'lucide-react';

interface ReceiptViewProps {
  job: PrintJob;
  payment: PaymentDetails;
  onProceedToPrint: () => void;
}

export default function ReceiptView({ job, payment, onProceedToPrint }: ReceiptViewProps) {
  const [activeTab, setActiveTab] = useState<'client' | 'merchant'>('client');
  const [copied, setCopied] = useState(false);

  // Read dynamic manager configuration if present
  const activeBrand = (() => {
    try {
      const saved = localStorage.getItem('avast_brand_config');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      companyName: 'AVAST GRÁFICA MOÇAMBIQUE',
      nuit: '400189422',
      address: 'Av. Vladimir Lenine, N° 1240, Maputo',
      contact: '+258 84 910 2840'
    };
  })();

  const mockReceiptDetails: ReceiptInfo = {
    printJob: job,
    payment: payment,
    companyName: activeBrand.companyName,
    nuit: activeBrand.nuit.startsWith('NUIT') ? activeBrand.nuit : `NUIT: ${activeBrand.nuit}`,
    address: activeBrand.address,
    contact: activeBrand.contact
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(payment.transactionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6" id="receipt-screen-panel">
      
      {/* Banner */}
      <div className="text-center flex flex-col items-center gap-3 bg-brand-teal-dark border border-brand-green/30 p-6 rounded-3xl" id="success-banner">
        <div className="w-16 h-16 rounded-full bg-brand-green/10 border-2 border-brand-green flex items-center justify-center text-brand-green shadow-lg animate-pulse">
          <CheckCircle className="w-10 h-10" />
        </div>
        <div>
          <h2 className="font-display font-extrabold text-2xl text-brand-gold uppercase tracking-wide">
            Pagamento Confirmado!
          </h2>
          <p className="text-sm text-gray-300 mt-1">
            Seu saldo foi debitado com sucesso via <span className="text-brand-orange uppercase font-bold text-xs">{payment.operator}</span>.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-brand-teal-dark/60 p-1.5 rounded-xl border border-brand-teal-light/40" id="receipt-mode-tabs">
        <button
          onClick={() => setActiveTab('client')}
          className={`w-1/2 py-2.5 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 ${
            activeTab === 'client'
              ? 'bg-brand-gold text-brand-teal-deep shadow-md'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <span>Via Cliente (Digital)</span>
          <Bookmark className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setActiveTab('merchant')}
          className={`w-1/2 py-2.5 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 ${
            activeTab === 'merchant'
              ? 'bg-brand-gold text-brand-teal-deep shadow-md'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <span>Via Estabelecimento</span>
          <Split className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Serrated/Tear aesthetic Voucher Receipt */}
      <div className="relative bg-white text-gray-900 rounded-2xl shadow-2xl p-6 md:p-8 font-sans overflow-hidden border-t-8 border-brand-gold" id="serrated-receipt-paper">
        {/* Serrated edges visualization (HTML) */}
        <div className="absolute top-0 left-0 right-0 h-1.5 flex overflow-hidden">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="w-4 h-4 bg-brand-teal-deep rotate-45 -translate-y-2 flex-shrink-0" />
          ))}
        </div>

        {/* Brand Stamp */}
        <div className="text-center flex flex-col items-center mt-4">
          <h3 className="font-display font-black text-xl tracking-wider text-brand-teal-deep uppercase">
            AVAST GRÁFICA
          </h3>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mt-0.5">
            {activeTab === 'client' ? 'Comprovante do Cliente' : 'Comprovante de Caixa'}
          </p>
        </div>

        {/* Corporate specifications */}
        <div className="border-b border-dashed border-gray-300 py-4 my-4 text-center text-xs text-gray-600 flex flex-col gap-1">
          <p className="font-semibold">{mockReceiptDetails.companyName}</p>
          <p className="font-mono text-[10px]">{mockReceiptDetails.nuit}</p>
          <p className="flex items-center justify-center gap-1"><MapPin className="w-3 h-3 text-brand-orange" /> {mockReceiptDetails.address}</p>
          <p className="flex items-center justify-center gap-1"><PhoneCall className="w-3 h-3 text-brand-blue" /> {mockReceiptDetails.contact}</p>
        </div>

        {/* Transaction & Payment details */}
        <div className="flex flex-col gap-2.5 text-xs border-b border-dashed border-gray-300 pb-4">
          <div className="flex justify-between">
            <span className="text-gray-500">ID da Transação:</span>
            <span className="font-mono font-bold text-gray-800 flex items-center gap-1">
              {payment.transactionId}
              <button 
                onClick={handleCopyCode} 
                className="p-1 hover:bg-gray-100 rounded text-brand-blue transition"
                title="Copiar ID"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-brand-green" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Data e Hora:</span>
            <span className="font-medium text-gray-800">{payment.timestamp}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Método de Débito:</span>
            <span className="font-bold text-brand-teal-mid uppercase">
              {payment.operator === 'mpesa' ? 'Vodacom M-Pesa' : 'Movitel e-Mola'} ({payment.phoneNumber.substring(0, 7)}****)
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Ref Ficheiro:</span>
            <span className="font-medium text-gray-800 break-all max-w-[200px] text-right truncate">
              {job.fileName}
            </span>
          </div>
        </div>

        {/* Itemized breakdowns */}
        <div className="py-4 border-b border-dashed border-gray-300">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-500 text-left font-semibold">
                <th className="pb-1.5">Descrição do Serviço</th>
                <th className="text-center pb-1.5">Qtd</th>
                <th className="text-right pb-1.5">Val. Unit</th>
                <th className="text-right pb-1.5">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr className="text-gray-800">
                <td className="py-1">
                  Impressão {job.paperSize} ({job.colorMode === 'bw' ? 'Preto e Branco' : 'Colorido'})
                </td>
                <td className="text-center py-1 font-mono">{job.totalPages} pág</td>
                <td className="text-right py-1 font-mono">{job.pricePerPage.toFixed(2)}</td>
                <td className="text-right py-1 font-mono">{(job.totalPages * job.pricePerPage).toFixed(2)}</td>
              </tr>
              {job.copies > 1 && (
                <tr className="text-gray-600 text-[11px] italic">
                  <td className="py-0.5 pl-2">Múltiplas cópias</td>
                  <td className="text-center py-0.5 font-mono">×{job.copies}</td>
                  <td className="text-right py-0.5">-</td>
                  <td className="text-right py-0.5">-</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Total Price */}
        <div className="pt-4 flex flex-col gap-2">
          <div className="flex justify-between items-baseline">
            <span className="font-display font-bold text-gray-700">VALOR COBRADO</span>
            <span className="text-xl font-mono font-bold text-brand-orange">
              {payment.amount.toFixed(2)} MT
            </span>
          </div>
          <p className="text-[10px] text-gray-500 text-right italic font-mono">
            IVA Incluído (16% Moçambique Tax)
          </p>
        </div>

        {/* Bottom design elements / QR validation */}
        <div className="mt-6 flex flex-col items-center gap-2 border-t border-gray-200 pt-5">
          {/* Simulated scanning barcode / qr */}
          <div className="w-40 h-10 bg-gray-100 p-1 flex items-center justify-center border border-gray-300 rounded overflow-hidden">
            <div className="w-full h-full flex gap-0.5">
              {Array.from({ length: 32 }).map((_, idx) => (
                <div 
                  key={idx} 
                  className="bg-gray-900 h-full" 
                  style={{ width: `${(idx % 3 === 0 ? 3 : (idx % 2 === 0 ? 1 : 2))}px`, opacity: idx % 5 === 1 ? 0 : 1 }} 
                />
              ))}
            </div>
          </div>
          <p className="text-[9px] text-gray-400 font-mono tracking-wider">
            Série:{job.id} | Aut: {payment.transactionId.substring(0, 8)}
          </p>
          <div className="text-[9px] text-gray-400 text-center mt-1 uppercase tracking-widest font-bold">
            Obrigado pela preferência!
          </div>
        </div>

        {/* Bottom Serrated visual cut */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 flex overflow-hidden">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="w-4 h-4 bg-brand-teal-deep rotate-45 translate-y-2 flex-shrink-0" />
          ))}
        </div>
      </div>

      {/* Primary Actions panel */}
      <div className="flex flex-col gap-3" id="print-receipt-control-deck">
        <button
          onClick={onProceedToPrint}
          className="w-full py-4 rounded-2xl bg-brand-orange hover:bg-brand-orange/90 text-white font-sans font-bold text-base shadow-lg shadow-brand-orange/20 hover:scale-[1.01] transition flex items-center justify-center gap-3 animate-pulse active:scale-95"
          id="trigger-automatic-print-btn"
        >
          <Printer className="w-6 h-6 animate-bounce" />
          <span>IMPRIMIR DOCUMENTO REGISTADO AGORA</span>
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => window.print()}
            className="py-3 border border-brand-gold/20 hover:bg-brand-teal-mid/30 text-gray-300 font-sans font-semibold text-sm rounded-xl transition flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Descarregar PDF</span>
          </button>
          <button
            onClick={() => alert('Parceiro notificado sobre a transação por SMS!')}
            className="py-3 border border-brand-gold/20 hover:bg-brand-teal-mid/30 text-gray-300 font-sans font-semibold text-sm rounded-xl transition flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4 text-brand-green" />
            <span>Enviar por SMS</span>
          </button>
        </div>
      </div>

    </div>
  );
}
