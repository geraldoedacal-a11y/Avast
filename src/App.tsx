import React, { useState, useEffect } from 'react';
import FileUploader from './components/FileUploader';
import PaymentModal from './components/PaymentModal';
import ReceiptView from './components/ReceiptView';
import ThermalPrinter from './components/ThermalPrinter';
import { PrintJob, PaymentDetails } from './types';
import { 
  Coins, 
  Receipt, 
  ArrowRight, 
  Printer, 
  ShieldCheck, 
  Heart, 
  Info, 
  Clock, 
  LayoutDashboard, 
  Settings, 
  User, 
  Database, 
  Play, 
  Trash2, 
  Check, 
  RefreshCw, 
  Sparkles,
  Layers,
  MapPin,
  Building,
  PhoneCall,
  Hash
} from 'lucide-react';

export default function App() {
  const [activeJob, setActiveJob] = useState<PrintJob | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  
  // App modes: 'client' (Customer kiosk terminal) or 'enterprise' (Merchant control panel)
  const [appMode, setAppMode] = useState<'client' | 'enterprise'>('client');
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // Custom business printing prices
  const [prices, setPrices] = useState(() => {
    const saved = localStorage.getItem('avast_prices_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      A3: { bw: 10, color: 80 },
      A4: { bw: 3, color: 30 },
      A5: { bw: 3, color: 15 },
      A6: { bw: 3, color: 15 },
      Thermal: { bw: 3, color: 3 }
    };
  });

  // Corporate brand config (stored globally)
  const [brandConfig, setBrandConfig] = useState(() => {
    const saved = localStorage.getItem('avast_brand_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      companyName: 'AVAST GRÁFICA MOÇAMBIQUE Limitada',
      nuit: '400189422',
      address: 'Av. Vladimir Lenine, N° 1240, Maputo',
      contact: '+258 84 910 2840'
    };
  });

  // Payment integration configurations (M-Pesa, e-Mola, Webhooks)
  const [paymentConfig, setPaymentConfig] = useState(() => {
    const saved = localStorage.getItem('avast_payment_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      mode: 'simulated',
      gatewayUrl: 'https://api.paytek.co.mz/v1/c2b',
      apiKey: 'pk_live_avast400189422',
      mpesaServiceCode: '900412',
      emolaMerchantId: '772183',
      webhookUrl: 'https://avastgrafica.co.mz/api/v1/payments/webhook'
    };
  });

  // Print history state
  const [history, setHistory] = useState<Array<{ job: PrintJob; pay: PaymentDetails }>>(() => {
    const saved = localStorage.getItem('avast_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    // Seed with beautiful realistic Moçambique business transactions if empty
    return [
      {
        job: {
          id: 'JOB-948210',
          fileName: 'Contrato_Prestacao_Servicos_Avast.pdf',
          fileSize: '430 KB',
          fileType: 'PDF',
          totalPages: 4,
          copies: 2,
          colorMode: 'bw' as const,
          paperSize: 'A4' as const,
          pricePerPage: 3.00,
          totalPrice: 24.00,
          status: 'completed' as const
        },
        pay: {
          phoneNumber: '+258 84 391 0284',
          operator: 'mpesa' as const,
          transactionId: 'MP948210482',
          amount: 24.00,
          timestamp: '19/06/2026 09:30:15'
        }
      },
      {
        job: {
          id: 'JOB-284910',
          fileName: 'Capa_Revista_Portefolio_Final.png',
          fileSize: '1.2 MB',
          fileType: 'Photo',
          totalPages: 1,
          copies: 5,
          colorMode: 'color' as const,
          paperSize: 'A3' as const,
          pricePerPage: 80.00,
          totalPrice: 400.00,
          status: 'completed' as const
        },
        pay: {
          phoneNumber: '+258 86 102 9481',
          operator: 'emola' as const,
          transactionId: 'EM102948123',
          amount: 400.00,
          timestamp: '18/06/2026 16:45:20'
        }
      },
      {
        job: {
          id: 'JOB-102948',
          fileName: 'Recibo_Pagamento_Fatura_Aguas.pdf',
          fileSize: '120 KB',
          fileType: 'PDF',
          totalPages: 1,
          copies: 1,
          colorMode: 'bw' as const,
          paperSize: 'A5' as const,
          pricePerPage: 3.00,
          totalPrice: 3.00,
          status: 'completed' as const
        },
        pay: {
          phoneNumber: '+258 84 928 2901',
          operator: 'mpesa' as const,
          transactionId: 'MP102948571',
          amount: 3.00,
          timestamp: '18/06/2026 11:15:02'
        }
      }
    ];
  });

  // Synchronize history/prices/brand to localStorage
  useEffect(() => {
    localStorage.setItem('avast_prices_v2', JSON.stringify(prices));
  }, [prices]);

  useEffect(() => {
    localStorage.setItem('avast_brand_config', JSON.stringify(brandConfig));
  }, [brandConfig]);

  useEffect(() => {
    localStorage.setItem('avast_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('avast_payment_config', JSON.stringify(paymentConfig));
  }, [paymentConfig]);

  // Handle flash feedback alerts smoothly
  const triggerAlertMessage = (msg: string) => {
    setAlertMessage(msg);
    setTimeout(() => {
      setAlertMessage(null);
    }, 4000);
  };

  const handleJobCreated = (job: PrintJob) => {
    setActiveJob(job);
  };

  const handlePaymentSuccess = (details: PaymentDetails) => {
    setPaymentDetails(details);
    if (activeJob) {
      setActiveJob({
        ...activeJob,
        status: 'paid'
      });
    }
  };

  const handleProceedToPrint = () => {
    if (activeJob) {
      setActiveJob({
        ...activeJob,
        status: 'printing'
      });
    }
  };

  const handlePrintFinished = () => {
    if (activeJob && paymentDetails) {
      const finalJob: PrintJob = { ...activeJob, status: 'completed' };
      setActiveJob(finalJob);
      setHistory(prev => [
        { job: finalJob, pay: paymentDetails },
        ...prev
      ]);
    }
  };

  const startNewJob = () => {
    setActiveJob(null);
    setPaymentDetails(null);
  };

  const cancelJob = () => {
    setActiveJob(null);
    setPaymentDetails(null);
  };

  // Administration dashboard computations
  const totalVolumeMT = history.reduce((sum, item) => sum + item.pay.amount, 0);
  const totalSheetsPrinted = history.reduce((sum, item) => sum + (item.job.totalPages * item.job.copies), 0);
  const totalJobsCompleted = history.length;

  const countByPaperSize = (size: string) => {
    return history
      .filter(item => item.job.paperSize === size)
      .reduce((sum, item) => sum + (item.job.totalPages * item.job.copies), 0);
  };

  // Reset prices to Mozambican standard requested rules as default fallback
  const handleResetPrices = () => {
    const defaultVals = {
      A3: { bw: 10, color: 80 },
      A4: { bw: 3, color: 30 },
      A5: { bw: 3, color: 15 },
      A6: { bw: 3, color: 15 },
      Thermal: { bw: 3, color: 3 }
    };
    setPrices(defaultVals);
    triggerAlertMessage('💡 Tabela de preços reposta com as taxas solicitadas do decreto!');
  };

  // Add simulated diagnostic test page straight to printing simulation cycle
  const handleSimulateTestPrint = () => {
    const testJob: PrintJob = {
      id: 'JOB-TEST-' + Math.floor(1000 + Math.random() * 9000),
      fileName: 'PAGINA_TESTE_ALINHAMENTO_AVAST.jpg',
      fileSize: '2.4 MB',
      fileType: 'Photo',
      totalPages: 1,
      copies: 1,
      colorMode: 'color',
      paperSize: 'A4',
      pricePerPage: prices.A4.color,
      totalPrice: prices.A4.color,
      status: 'pending_payment'
    };

    const testPay: PaymentDetails = {
      phoneNumber: '+258 84 000 0000',
      operator: 'mpesa',
      transactionId: 'MPTEST' + Math.floor(100000 + Math.random() * 900000),
      amount: prices.A4.color,
      timestamp: new Date().toLocaleDateString('pt-MZ') + ' ' + new Date().toLocaleTimeString('pt-MZ')
    };

    // Auto set to Paid so we bypass mobile smartphone simulation and jump straight into printer motor simulation!
    setActiveJob({
      ...testJob,
      status: 'paid'
    });
    setPaymentDetails(testPay);
    setAppMode('client'); // view client printer screen immediately
    triggerAlertMessage('🚀 Iniciada impressão de página técnica de teste!');
  };

  const handleClearHistory = () => {
    if (window.confirm('Atenção: Tem certeza que deseja apagar permanentemente todos os relatórios de venda d\'A Avast Gráfica?')) {
      setHistory([]);
      triggerAlertMessage('🗑️ Todo a histórico de faturamento e logs foram excluídos.');
    }
  };

  return (
    <div className="min-h-screen bg-brand-teal-deep text-gray-100 flex flex-col font-sans relative overflow-hidden selection:bg-brand-gold/30 selection:text-white" id="app-root">
      
      {/* Background ambient elegant graphic styling cues */}
      <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-brand-teal-mid/30 via-transparent to-transparent pointer-events-none select-none" />
      <div className="absolute top-[-10%] left-[-20%] w-[60%] aspect-square rounded-full rainbow-glow opacity-10 pointer-events-none select-none filter blur-[150px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] aspect-square rounded-full bg-brand-gold/5 pointer-events-none select-none filter blur-[120px]" />

      {/* Corporate header bar */}
      <header className="border-b border-brand-gold/15 bg-brand-teal-deep/85 backdrop-blur-md sticky top-0 z-40 shadow-lg" id="main-header">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <div>
              <span className="font-display font-black text-xl gold-text tracking-wide uppercase block">AVAST GRAFICA</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#a3b2bc]">Inovamos a sua ideia, só</span>
              </div>
            </div>
          </div>

          {/* Quick Dual-Mode Tabs Switcher */}
          <div className="bg-[#091116] p-1.5 rounded-2xl border border-brand-gold/15 flex items-center gap-1">
            <button
              onClick={() => {
                setAppMode('client');
                triggerAlertMessage('👤 Terminal de Uso do Cliente focado.');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-sans transition flex items-center gap-1.5 ${
                appMode === 'client'
                  ? 'bg-brand-gold text-brand-teal-deep shadow'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-brand-teal-mid/20'
              }`}
              id="switch-client-mode-btn"
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Uso do Cliente</span>
            </button>
            <button
              onClick={() => {
                setAppMode('enterprise');
                triggerAlertMessage('💼 Painel de Controlo da Empresa ativado.');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-sans transition flex items-center gap-1.5 ${
                appMode === 'enterprise'
                  ? 'bg-brand-orange text-white shadow'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-brand-teal-mid/20'
              }`}
              id="switch-admin-mode-btn"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Controlo da Empresa</span>
            </button>
          </div>

          {/* System status pill trackers */}
          <div className="hidden lg:flex items-center gap-4 text-xs font-mono text-gray-400">
            <div className="flex items-center gap-1.5 bg-brand-teal-dark border border-brand-gold/10 px-3 py-1.5 rounded-lg text-brand-gold">
              <Clock className="w-3.5 h-3.5" />
              <span>Maputo, MZ</span>
            </div>
            <div className="flex items-center gap-1.5 bg-brand-teal-dark border border-brand-gold/10 px-3 py-1.5 rounded-lg text-brand-green">
              <span className="w-2 h-2 rounded-full bg-brand-green animate-ping" />
              <span>TERMINAL AUTÓNOMO</span>
            </div>
          </div>

        </div>
      </header>

      {/* Floating flash notifications alerts */}
      {alertMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0d161d] border border-brand-gold/40 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in" id="system-toast-banner">
          <Sparkles className="w-4 h-4 text-brand-gold animate-bounce" />
          <p className="text-xs font-sans text-gray-200 font-medium">{alertMessage}</p>
        </div>
      )}

      {/* Main Container workspace */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 z-10 flex flex-col items-center justify-start gap-12" id="main-workspace">
        
        {/* ================= MODE 1: CLIENT KIOSK WORKSPACE ================= */}
        {appMode === 'client' && (
          <div className="w-full flex flex-col gap-10 animate-fade-in">
            
            {/* Hero Section */}
            {!activeJob && (
              <div className="text-center">
                <h1 className="font-display font-black text-5xl md:text-6xl tracking-wider uppercase gold-text" style={{ textShadow: '0 4px 15px rgba(0,0,0,0.85)' }}>
                  AVAST GRÁFICA
                </h1>
                <p className="font-sans font-extrabold text-sm tracking-[0.45em] uppercase text-brand-gold mt-2.5">
                  Inovamos a sua ideia, só
                </p>
                <p className="text-sm md:text-base text-gray-300 max-w-2xl mx-auto mt-6" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                  Carregue documentos em segundos. Efetue a liquidação instantânea com Vodacom <b className="text-brand-red">M-Pesa</b> ou Movitel <b className="text-brand-orange">e-Mola</b> e assuste-se com a nossa impressora USB autónoma imprimindo em tempo real!
                </p>
              </div>
            )}

            {/* State 1.1: Standard terminal form uploader and pricing sideboards */}
            {!activeJob && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* File input drag and drop area card */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                  <div className="glass-panel p-6 rounded-3xl flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-brand-gold/10 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-brand-gold">📂</span>
                        <h3 className="font-display font-bold text-base text-gray-100 uppercase tracking-wider">Submeter Ficheiro para Impressão</h3>
                      </div>
                      <span className="text-[10px] font-mono text-gray-500 uppercase">Processador Integrado</span>
                    </div>
                    {/* Inject dynamic prices so uploader prints estimated prices dynamically! */}
                    <FileUploader onJobCreated={handleJobCreated} prices={prices} />
                  </div>
                </div>

                {/* Pricing rules table sideboard */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  
                  {/* Dynamic Pricing Cards */}
                  <div className="glass-panel p-6 rounded-3xl flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-brand-gold/10 pb-3">
                      <div className="flex items-center gap-2">
                        <Coins className="text-brand-orange w-5 h-5" />
                        <h3 className="font-display font-semibold text-base text-brand-gold uppercase tracking-wider">Preçário Oficial</h3>
                      </div>
                      <span className="text-[9px] font-mono bg-brand-gold/15 text-brand-gold px-1.5 py-0.5 rounded font-bold">MZN</span>
                    </div>

                    <div className="flex flex-col gap-3 font-sans text-sm">
                      <div className="flex justify-between items-center py-1.5 border-b border-brand-gold/5">
                        <span className="text-gray-300">Papel A3 - P&B</span>
                        <span className="font-mono font-bold text-brand-gold">{prices.A3.bw.toFixed(2)} MT <span className="text-[10px] font-sans text-gray-500">/ pág</span></span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-brand-gold/5">
                        <span className="text-gray-300">Papel A3 - Colorido</span>
                        <span className="font-mono font-bold text-brand-orange">{prices.A3.color.toFixed(2)} MT <span className="text-[10px] font-sans text-gray-400">/ pág</span></span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-brand-gold/5">
                        <span className="text-gray-300">Papel A4 - P&B</span>
                        <span className="font-mono font-bold text-brand-gold">{prices.A4.bw.toFixed(2)} MT <span className="text-[10px] font-sans text-gray-500">/ pág</span></span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-brand-gold/5">
                        <span className="text-gray-300">Papel A4 - Colorido</span>
                        <span className="font-mono font-bold text-brand-orange">{prices.A4.color.toFixed(2)} MT <span className="text-[10px] font-sans text-gray-400">/ pág</span></span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-brand-gold/5">
                        <span className="text-gray-300">Papel A5 - P&B</span>
                        <span className="font-mono font-bold text-brand-gold">{prices.A5.bw.toFixed(2)} MT <span className="text-[10px] font-sans text-gray-500">/ pág</span></span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-brand-gold/5">
                        <span className="text-gray-300">Papel A5 - Colorido</span>
                        <span className="font-mono font-bold text-brand-orange">{prices.A5.color.toFixed(2)} MT <span className="text-[10px] font-sans text-gray-400">/ pág</span></span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-brand-gold/5">
                        <span className="text-gray-300">Papel A6 - P&B</span>
                        <span className="font-mono font-bold text-brand-gold">{prices.A6.bw.toFixed(2)} MT <span className="text-[10px] font-sans text-gray-500">/ pág</span></span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-brand-gold/5">
                        <span className="text-gray-300">Papel A6 - Colorido</span>
                        <span className="font-mono font-bold text-brand-orange">{prices.A6.color.toFixed(2)} MT <span className="text-[10px] font-sans text-gray-400">/ pág</span></span>
                      </div>
                      <div className="flex justify-between items-center py-1.5">
                        <span className="text-gray-300">Fita Térmica (Bobina)</span>
                        <span className="font-mono font-bold text-brand-blue">{prices.Thermal.bw.toFixed(2)} MT <span className="text-[10px] font-sans text-gray-400">/ pág</span></span>
                      </div>
                    </div>

                    <div className="rounded-xl bg-brand-teal-deep/50 p-3.5 flex items-start gap-2.5 mt-2 border border-brand-gold/5 text-xs text-gray-400">
                      <Info className="w-4 h-4 text-brand-gold flex-shrink-0 mt-0.5" />
                      <p>
                        Garantia de conformidade de faturamento do caixa d'A Avast Gráfica. Preços modificáveis em tempo de gerência empresarial no painel corporativo.
                      </p>
                    </div>
                  </div>

                  {/* Customer personal local print history metrics */}
                  {history.length > 0 && (
                    <div className="glass-panel p-6 rounded-3xl flex flex-col gap-4 animate-fade-in" id="history-panel">
                      <div className="flex items-center gap-2 border-b border-brand-gold/10 pb-3">
                        <Receipt className="text-brand-blue w-5 h-5" />
                        <h3 className="font-display font-semibold text-base text-neutral-200 uppercase tracking-wider">Trabalhos Concluídos</h3>
                      </div>

                      <div className="flex flex-col gap-3 max-h-52 overflow-y-auto pr-1">
                        {history.slice(0, 4).map((item, idx) => (
                          <div key={idx} className="bg-brand-teal-deep/60 rounded-xl p-3 border border-brand-gold/5 text-xs flex flex-col gap-1.5 hover:border-brand-gold/20 transition">
                            <div className="flex justify-between font-medium">
                              <span className="text-gray-200 truncate pr-4 max-w-[155px]">{item.job.fileName}</span>
                              <span className="text-brand-orange font-mono font-bold">{item.pay.amount.toFixed(2)} MT</span>
                            </div>
                            <div className="flex justify-between text-gray-400 font-mono text-[10px]">
                              <span>Pág: {item.job.totalPages} • Papel {item.job.paperSize}</span>
                              <span className="uppercase text-brand-green font-bold">CONCLUÍDO ✓</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

              </div>
            )}

            {/* State 1.2: Suspended with Payment interactive screen overlay */}
            {activeJob && (activeJob.status === 'pending_payment' || activeJob.status === 'paying') && (
              <PaymentModal
                job={activeJob}
                paymentConfig={paymentConfig}
                onPaymentSuccess={handlePaymentSuccess}
                onCancel={cancelJob}
              />
            )}

            {/* State 1.3: Mobile SMS checkout / receipt view for confirmation */}
            {activeJob && activeJob.status === 'paid' && paymentDetails && (
              <div className="w-full flex flex-col gap-6 animate-fade-in">
                <ReceiptView
                  job={activeJob}
                  payment={paymentDetails}
                  onProceedToPrint={handleProceedToPrint}
                />
              </div>
            )}

            {/* State 1.4: Thermal printer active simulation */}
            {activeJob && activeJob.status === 'printing' && (
              <div className="w-full flex flex-col gap-6 animate-fade-in">
                <h2 className="font-display text-center font-bold text-xl text-brand-gold uppercase tracking-widest animate-pulse">
                  Impressão Física em Curso...
                </h2>
                <ThermalPrinter
                  job={activeJob}
                  onCompleted={handlePrintFinished}
                />
              </div>
            )}

            {/* State 1.5: Completed job feedback */}
            {activeJob && activeJob.status === 'completed' && paymentDetails && (
              <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center text-center gap-6 glass-panel p-8 md:p-12 rounded-3xl border border-brand-gold/25 my-4 animate-fade-in">
                <div className="w-20 h-20 rounded-full bg-brand-green/15 border-2 border-brand-green/80 flex items-center justify-center text-brand-green shadow-xl shadow-brand-green/5">
                  <ShieldCheck className="w-12 h-12 animate-bounce" />
                </div>

                <div>
                  <h3 className="font-display font-black text-2.5xl text-brand-gold tracking-wide uppercase">
                    SUCESSO ABSOLUTO!
                  </h3>
                  <p className="text-gray-300 text-sm mt-2 max-w-md">
                    Seu ficheiro <b className="text-white break-all">"{activeJob.fileName}"</b> foi totalmente impresso com as taxas da Avast Gráfica. O comprovativo fiscal está indexado à transação.
                  </p>
                </div>

                <div className="w-full bg-brand-teal-deep/30 rounded-2xl p-4.5 border border-brand-gold/10 flex flex-col gap-2 text-xs text-left font-mono">
                  <div className="flex justify-between">
                    <span className="text-gray-400">ID da Fatura SMS:</span>
                    <span className="text-gray-100">{paymentDetails.transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Canal Utilizado:</span>
                    <span className="text-gray-100 uppercase font-bold">{paymentDetails.operator} ({paymentDetails.phoneNumber})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Taxa MZN Líquida:</span>
                    <span className="text-brand-orange font-bold font-sans">{paymentDetails.amount.toFixed(2)} MT</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full mt-4">
                  <button
                    onClick={startNewJob}
                    className="w-full py-3.5 bg-brand-gold text-brand-teal-deep hover:bg-brand-gold-dark rounded-xl transition text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-gold/15"
                  >
                    <span>Imprimir Novo Ficheiro</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ================= MODE 2: ENTERPRISE CONTROL DASHBOARD ================= */}
        {appMode === 'enterprise' && (
          <div className="w-full flex flex-col gap-10 animate-fade-in">
            
            {/* Header intro of Admin Panel */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-gold/15 pb-6">
              <div>
                <span className="px-3 py-1 bg-brand-orange/15 border border-brand-orange/30 text-brand-orange text-xs uppercase font-mono font-bold rounded-lg py-0.5">
                  MÓDULO DE GESTÃO E FISCALIZAÇÃO
                </span>
                <h2 className="font-display font-black text-3xl text-brand-gold mt-2 uppercase tracking-wide">
                  CONTROLO DA EMPRESA
                </h2>
                <p className="text-xs text-gray-400 mt-1 max-w-xl">
                  Configure as taxas de impressão real, altere os dados do cabeçalho da fatura fiscal / NUIT e verifique os relatórios consolidados de vendas do terminal automático.
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleSimulateTestPrint}
                  className="px-4 py-2 bg-gradient-to-r from-brand-orange to-red-600 hover:from-brand-orange/95 hover:to-red-600/95 text-white text-xs font-bold font-sans rounded-xl transition flex items-center gap-2 active:scale-95 shadow-md shadow-brand-orange/20"
                >
                  <Printer className="w-3.5 h-3.5 animate-pulse" />
                  <span>Imprimir Página Diagnóstico</span>
                </button>
                <button
                  onClick={handleResetPrices}
                  className="px-4 py-2 border border-brand-gold/20 hover:border-brand-gold/45 text-brand-gold text-xs font-semibold font-sans rounded-xl transition flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Restaurar Preços Padrão</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Stat 1: Total Sales Revenue */}
              <div className="glass-panel p-5 rounded-2xl flex items-center justify-between border-l-4 border-brand-orange" id="metric-revenue">
                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest font-mono">Faturamento Caixa</span>
                  <span className="text-2.5xl font-mono font-black text-brand-orange mt-2">
                    {totalVolumeMT.toFixed(2)} <span className="text-xs font-sans text-gray-400">MT</span>
                  </span>
                  <span className="text-[10px] text-gray-500 mt-1">Acumulado em tempo real</span>
                </div>
                <div className="p-3 bg-brand-orange/10 rounded-full text-brand-orange font-bold font-mono">
                  MZN
                </div>
              </div>

              {/* Stat 2: Total Finished Jobs */}
              <div className="glass-panel p-5 rounded-2xl flex items-center justify-between border-l-4 border-brand-gold" id="metric-volumes">
                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest font-mono">Trabalhos Realizados</span>
                  <span className="text-2.5xl font-mono font-black text-brand-gold mt-2">
                    {totalJobsCompleted} <span className="text-xs font-sans text-gray-400">docs</span>
                  </span>
                  <span className="text-[10px] text-gray-500 mt-1">Impressões autônomas USB</span>
                </div>
                <div className="p-3 bg-brand-gold/10 rounded-full text-brand-gold">
                  <Database className="w-5 h-5" />
                </div>
              </div>

              {/* Stat 3: Total Sheets Printed */}
              <div className="glass-panel p-5 rounded-2xl flex items-center justify-between border-l-4 border-brand-blue" id="metric-sheets">
                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest font-mono">Total de Páginas</span>
                  <span className="text-2.5xl font-mono font-black text-brand-blue mt-2">
                    {totalSheetsPrinted} <span className="text-xs font-sans text-gray-400">fls</span>
                  </span>
                  <span className="text-[10px] text-gray-500 mt-1">Multiplicador de cópias gasta</span>
                </div>
                <div className="p-3 bg-brand-blue/10 rounded-full text-brand-blue">
                  <Layers className="w-5 h-5" />
                </div>
              </div>

              {/* Stat 4: Consumed thermal roll estimate */}
              <div className="glass-panel p-5 rounded-2xl flex items-center justify-between border-l-4 border-brand-green" id="metric-roll">
                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest font-mono">Bobina Térmica</span>
                  <span className="text-2.5xl font-mono font-black text-brand-green mt-2">
                    {(totalSheetsPrinted * 0.15).toFixed(2)} <span className="text-xs font-sans text-gray-400">mtrs</span>
                  </span>
                  <span className="text-[10px] text-gray-500 mt-1">Consumo residual do cortador</span>
                </div>
                <div className="p-3 bg-brand-green/10 rounded-full text-brand-green">
                  <Printer className="w-5 h-5 animate-pulse" />
                </div>
              </div>

            </div>

            {/* Layout Grid: Price Editor Form & Header Fatura details */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Custom printing prices configurator */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                
                <div className="glass-panel p-6 rounded-3xl flex flex-col gap-6">
                  <div className="flex items-center gap-2 border-b border-brand-gold/10 pb-3">
                    <Coins className="text-brand-orange w-5 h-5" />
                    <h3 className="font-display font-bold text-base text-gray-100 uppercase tracking-wider">
                      Editor de Taxas de Impressão (MZN)
                    </h3>
                  </div>

                  <p className="text-xs text-gray-400 leading-relaxed -mt-2">
                    Modifique em tempo real as taxas e valores cobrados por cada folha enviada ao terminal. Os valores editados alteram instantaneamente o formulário do cliente e sua respectiva simulação.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-2">
                    
                    {/* A3 Prices config Group */}
                    <div className="flex flex-col gap-4 bg-brand-teal-deep/40 rounded-2xl p-4 border border-brand-gold/10">
                      <h4 className="font-display font-semibold text-[#a3b2bc] text-xs uppercase tracking-wider border-b border-brand-gold/5 pb-2">
                        Papel Formato A3
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] text-gray-400">Preto & Branco (P&B)</label>
                          <div className="relative">
                            <input
                              type="number"
                              value={prices.A3.bw}
                              onChange={(e) => setPrices({
                                ...prices,
                                A3: { ...prices.A3, bw: Math.max(0, parseFloat(e.target.value) || 0) }
                              })}
                              className="w-full pl-3 pr-8 py-2 bg-[#091116] rounded-xl border border-brand-gold/10 text-brand-gold font-mono text-sm outline-none focus:border-brand-gold"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-mono">MT</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] text-gray-400">Colorido</label>
                          <div className="relative">
                            <input
                              type="number"
                              value={prices.A3.color}
                              onChange={(e) => setPrices({
                                ...prices,
                                A3: { ...prices.A3, color: Math.max(0, parseFloat(e.target.value) || 0) }
                              })}
                              className="w-full pl-3 pr-8 py-2 bg-[#091116] rounded-xl border border-brand-gold/10 text-brand-orange font-mono text-sm outline-none focus:border-brand-gold"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-mono">MT</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* A4 Prices config Group */}
                    <div className="flex flex-col gap-4 bg-brand-teal-deep/40 rounded-2xl p-4 border border-brand-gold/10">
                      <h4 className="font-display font-semibold text-[#a3b2bc] text-xs uppercase tracking-wider border-b border-brand-gold/5 pb-2">
                        Papel Formato A4
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] text-gray-400">Preto & Branco (P&B)</label>
                          <div className="relative">
                            <input
                              type="number"
                              value={prices.A4.bw}
                              onChange={(e) => setPrices({
                                ...prices,
                                A4: { ...prices.A4, bw: Math.max(0, parseFloat(e.target.value) || 0) }
                              })}
                              className="w-full pl-3 pr-8 py-2 bg-[#091116] rounded-xl border border-brand-gold/10 text-brand-gold font-mono text-sm outline-none focus:border-brand-gold"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-mono">MT</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] text-gray-400">Colorido</label>
                          <div className="relative">
                            <input
                              type="number"
                              value={prices.A4.color}
                              onChange={(e) => setPrices({
                                ...prices,
                                A4: { ...prices.A4, color: Math.max(0, parseFloat(e.target.value) || 0) }
                              })}
                              className="w-full pl-3 pr-8 py-2 bg-[#091116] rounded-xl border border-brand-gold/10 text-brand-orange font-mono text-sm outline-none focus:border-brand-gold"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-mono">MT</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* A5 Prices config Group */}
                    <div className="flex flex-col gap-4 bg-brand-teal-deep/40 rounded-2xl p-4 border border-brand-gold/10">
                      <h4 className="font-display font-semibold text-[#a3b2bc] text-xs uppercase tracking-wider border-b border-brand-gold/5 pb-2">
                        Papel Formato A5
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] text-gray-400">Preto & Branco (P&B)</label>
                          <div className="relative">
                            <input
                              type="number"
                              value={prices.A5.bw}
                              onChange={(e) => setPrices({
                                ...prices,
                                A5: { ...prices.A5, bw: Math.max(0, parseFloat(e.target.value) || 0) }
                              })}
                              className="w-full pl-3 pr-8 py-2 bg-[#091116] rounded-xl border border-brand-gold/10 text-brand-gold font-mono text-sm outline-none focus:border-brand-gold"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-mono">MT</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] text-gray-400">Colorido</label>
                          <div className="relative">
                            <input
                              type="number"
                              value={prices.A5.color}
                              onChange={(e) => setPrices({
                                ...prices,
                                A5: { ...prices.A5, color: Math.max(0, parseFloat(e.target.value) || 0) }
                              })}
                              className="w-full pl-3 pr-8 py-2 bg-[#091116] rounded-xl border border-brand-gold/10 text-brand-orange font-mono text-sm outline-none focus:border-brand-gold"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-mono">MT</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* A6 Prices config Group */}
                    <div className="flex flex-col gap-4 bg-brand-teal-deep/40 rounded-2xl p-4 border border-brand-gold/10">
                      <h4 className="font-display font-semibold text-[#a3b2bc] text-xs uppercase tracking-wider border-b border-brand-gold/5 pb-2">
                        Papel Formato A6
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] text-gray-400">Preto & Branco (P&B)</label>
                          <div className="relative">
                            <input
                              type="number"
                              value={prices.A6.bw}
                              onChange={(e) => setPrices({
                                ...prices,
                                A6: { ...prices.A6, bw: Math.max(0, parseFloat(e.target.value) || 0) }
                              })}
                              className="w-full pl-3 pr-8 py-2 bg-[#091116] rounded-xl border border-brand-gold/10 text-brand-gold font-mono text-sm outline-none focus:border-brand-gold"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-mono">MT</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] text-gray-400">Colorido</label>
                          <div className="relative">
                            <input
                              type="number"
                              value={prices.A6.color}
                              onChange={(e) => setPrices({
                                ...prices,
                                A6: { ...prices.A6, color: Math.max(0, parseFloat(e.target.value) || 0) }
                              })}
                              className="w-full pl-3 pr-8 py-2 bg-[#091116] rounded-xl border border-brand-gold/10 text-brand-orange font-mono text-sm outline-none focus:border-brand-gold"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-mono">MT</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bobina Thermal price configuration */}
                    <div className="flex flex-col gap-4 bg-brand-teal-deep/40 rounded-2xl p-4 border border-brand-gold/10 sm:col-span-2">
                      <h4 className="font-display font-semibold text-[#a3b2bc] text-xs uppercase tracking-wider border-b border-brand-gold/5 pb-2 flex items-center justify-between">
                        <span>Fita de Impressão Térmica (Por Bobina 80mm)</span>
                        <span className="text-[10px] text-gray-500 font-mono">Sem cor</span>
                      </h4>
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col gap-1.5 w-1/2">
                          <label className="text-[11px] text-gray-400">Preço Base por Bobina</label>
                          <div className="relative">
                            <input
                              type="number"
                              value={prices.Thermal.bw}
                              onChange={(e) => setPrices({
                                ...prices,
                                Thermal: { ...prices.Thermal, bw: Math.max(0, parseFloat(e.target.value) || 0), color: Math.max(0, parseFloat(e.target.value) || 0) }
                              })}
                              className="w-full pl-3 pr-8 py-2 bg-[#091116] rounded-xl border border-brand-gold/10 text-brand-blue font-mono text-sm outline-none focus:border-brand-gold"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-mono">MT</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 w-1/2 leading-tight">
                          Esta taxa é aplicada de forma estável quando o cliente decide gerar bobinas térmicas autônomas.
                        </p>
                      </div>
                    </div>

                  </div>

                  <div className="flex items-center justify-end border-t border-brand-gold/10 pt-4 mt-2">
                    <span className="text-xs text-[#a3b2bc] font-sans flex items-center gap-1">
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-brand-green animate-pulse" />
                      Gravado dinamicamente no armazenamento local corporativo.
                    </span>
                  </div>

                </div>

              </div>

              {/* Right Column: Company fiscal details setup (NUIT Address name etc) */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                
                {/* Brand Setup Fields Form */}
                <div className="glass-panel p-6 rounded-3xl flex flex-col gap-5">
                  <div className="flex items-center gap-2 border-b border-brand-gold/10 pb-3">
                    <Building className="text-brand-gold w-4 h-4" />
                    <h3 className="font-display font-bold text-base text-gray-100 uppercase tracking-wider">
                      Cabeçalho do Recibo
                    </h3>
                  </div>

                  <div className="flex flex-col gap-4 text-xs">
                    
                    {/* Input: Company Name */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-semibold text-gray-400 flex items-center gap-1">
                        <Building className="w-3 h-3 text-brand-gold" /> Nome Corporativo
                      </label>
                      <input
                        type="text"
                        value={brandConfig.companyName}
                        onChange={(e) => setBrandConfig({
                          ...brandConfig,
                          companyName: e.target.value
                        })}
                        className="py-2.5 px-3 bg-[#091116] rounded-xl border border-brand-gold/10 text-gray-100 outline-none focus:border-brand-gold text-xs font-medium"
                      />
                    </div>

                    {/* Input: Company NUIT */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-semibold text-gray-400 flex items-center gap-1">
                        <Hash className="w-3 h-3 text-brand-gold" /> NUIT da Empresa
                      </label>
                      <input
                        type="text"
                        value={brandConfig.nuit}
                        onChange={(e) => setBrandConfig({
                          ...brandConfig,
                          nuit: e.target.value
                        })}
                        className="py-2.5 px-3 bg-[#091116] rounded-xl border border-brand-gold/10 text-gray-100 outline-none focus:border-brand-gold text-xs font-mono"
                      />
                    </div>

                    {/* Input: Address */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-semibold text-gray-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-brand-gold" /> Localização / Cidade
                      </label>
                      <input
                        type="text"
                        value={brandConfig.address}
                        onChange={(e) => setBrandConfig({
                          ...brandConfig,
                          address: e.target.value
                        })}
                        className="py-2.5 px-3 bg-[#091116] rounded-xl border border-brand-gold/10 text-gray-100 outline-none focus:border-brand-gold text-xs"
                      />
                    </div>

                    {/* Input: Contact details */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-semibold text-gray-400 flex items-center gap-1">
                        <PhoneCall className="w-3 h-3 text-brand-gold" /> Contactos Telefónicos
                      </label>
                      <input
                        type="text"
                        value={brandConfig.contact}
                        onChange={(e) => setBrandConfig({
                          ...brandConfig,
                          contact: e.target.value
                        })}
                        className="py-2.5 px-3 bg-[#091116] rounded-xl border border-brand-gold/10 text-gray-100 outline-none focus:border-brand-gold text-xs"
                      />
                    </div>

                  </div>

                  <div className="rounded-xl bg-brand-teal-deep/50 p-3 border border-brand-gold/5 text-[11px] text-gray-400 line-clamp-3">
                    💡 Alterar estes dados reflete-se automaticamente no cupão de faturamento indexado d'A Avast Gráfica que o cliente descarrega em PDF!
                  </div>
                </div>

                {/* Simulated USB diagnostics */}
                <div className="glass-panel p-6 rounded-3xl flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-brand-gold/10 pb-3">
                    <span className="font-display font-bold text-xs text-[#a3b2bc] uppercase tracking-wider">
                      Auditoria de Hardware USB
                    </span>
                    <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
                  </div>

                  <div className="flex flex-col gap-2.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400 font-mono">Dispositivo Virtual:</span>
                      <span className="font-mono text-brand-gold font-bold">POS-T58 THERMAL</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 font-mono">Protocolo de Motor:</span>
                      <span className="font-mono text-gray-100">ESC/POS Cmd</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 font-mono">Taxa de Buffer USB:</span>
                      <span className="font-mono text-brand-green font-bold">100% Saudável</span>
                    </div>
                  </div>
                </div>

                {/* Real-World APIs, Mobile Money & Local Hardware Integration */}
                <div className="glass-panel p-6 rounded-3xl flex flex-col gap-5">
                  <div className="flex items-center justify-between border-b border-brand-gold/10 pb-3">
                     <div className="flex items-center gap-2">
                       <Database className="w-4 h-4 text-brand-orange" />
                       <h3 className="font-display font-bold text-sm text-gray-100 uppercase tracking-wider">
                         APIs & Carteiras Móveis
                       </h3>
                     </div>
                     <span className="text-[10px] bg-brand-orange/20 text-brand-orange px-1.5 py-0.5 rounded font-bold uppercase font-mono">Real-Time</span>
                  </div>

                  <div className="flex flex-col gap-4 text-xs font-sans">
                    {/* Mode selector */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-semibold text-gray-400 block">Modo Operacional de Cobrança</label>
                      <div className="grid grid-cols-2 gap-2 bg-[#091116] p-1 rounded-xl border border-brand-gold/10">
                        <button
                          type="button"
                          onClick={() => {
                            setPaymentConfig({ ...paymentConfig, mode: 'simulated' });
                            triggerAlertMessage('💡 Pagamentos configurados para modo interativo simulado.');
                          }}
                          className={`py-1.5 rounded-lg text-[10px] font-bold transition uppercase ${
                            paymentConfig.mode === 'simulated'
                              ? 'bg-brand-gold text-brand-teal-deep'
                              : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          Simulação Local
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPaymentConfig({ ...paymentConfig, mode: 'real_gateway' });
                            triggerAlertMessage('🚀 Iniciado modo de API corporativo real!');
                          }}
                          className={`py-1.5 rounded-lg text-[10px] font-bold transition uppercase ${
                            paymentConfig.mode === 'real_gateway'
                              ? 'bg-brand-orange text-white'
                              : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          Gateway Real
                        </button>
                      </div>
                    </div>

                    {paymentConfig.mode === 'real_gateway' && (
                      <div className="flex flex-col gap-3.5 p-3 rounded-xl bg-brand-orange/5 border border-brand-orange/20 animate-fade-in">
                        <p className="text-[10px] text-brand-orange font-semibold uppercase leading-tight">
                          ⚠️ ATENÇÃO: As credenciais inseridas abaixo disparam pushs USSD reais para os telemóveis dos clientes!
                        </p>
                        
                        {/* Gateway URL Input */}
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-gray-400">Endpoint API Gateway</span>
                          <input
                            type="text"
                            value={paymentConfig.gatewayUrl}
                            onChange={(e) => setPaymentConfig({ ...paymentConfig, gatewayUrl: e.target.value })}
                            className="bg-[#091116] border border-brand-gold/10 p-2 rounded text-gray-100 font-mono text-[11px]"
                          />
                        </div>

                        {/* Secret Chave API */}
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-gray-400">Chave Privada / API Token</span>
                          <input
                            type="text"
                            value={paymentConfig.apiKey}
                            onChange={(e) => setPaymentConfig({ ...paymentConfig, apiKey: e.target.value })}
                            className="bg-[#091116] border border-brand-gold/10 p-2 rounded text-gray-100 font-mono text-[11px]"
                          />
                        </div>

                        {/* Custom credentials */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] text-gray-400">M-Pesa Service Code</span>
                            <input
                              type="text"
                              value={paymentConfig.mpesaServiceCode}
                              onChange={(e) => setPaymentConfig({ ...paymentConfig, mpesaServiceCode: e.target.value })}
                              className="bg-[#091116] border border-brand-gold/10 p-2 rounded text-gray-100 font-mono text-[11px]"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] text-gray-400">e-Mola Merchant ID</span>
                            <input
                              type="text"
                              value={paymentConfig.emolaMerchantId}
                              onChange={(e) => setPaymentConfig({ ...paymentConfig, emolaMerchantId: e.target.value })}
                              className="bg-[#091116] border border-brand-gold/10 p-2 rounded text-gray-100 font-mono text-[11px]"
                            />
                          </div>
                        </div>

                        {/* Webhook notification target */}
                        <div className="flex flex-col gap-1 bg-[#091116] p-2 rounded border border-brand-gold/5 mt-1">
                          <span className="text-[9px] text-gray-400 font-mono uppercase block">Selo do Webhook Ativo</span>
                          <span className="text-[10px] text-brand-green font-mono font-bold mt-0.5 truncate block" title={paymentConfig.webhookUrl}>
                            URL: {paymentConfig.webhookUrl}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Agent script printer download */}
                    <div className="flex flex-col gap-2.5 p-3 rounded-xl bg-brand-teal-deep/50 border border-brand-gold/10 mt-1">
                      <span className="font-display font-semibold text-xs text-brand-gold uppercase tracking-wider block">
                        🔌 Impressora ESC/POS Fisica (print-server.js)
                      </span>
                      <p className="text-[11px] text-gray-400 leading-relaxed">
                        Copie o código do script local, salve como `print-server.js` na máquina do Totem e rode em background. O Totem enviará comandos directos à impressora USB conectada!
                      </p>

                      <div className="bg-[#080c0f] p-2 rounded-lg border border-brand-gold/5 max-h-36 overflow-y-auto font-mono text-[9px] text-gray-300">
{`const escpos = require('escpos');
escpos.USB = require('escpos-usb');
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/imprimir-recibo', (req, res) => {
  try {
    const device  = new escpos.USB();
    const printer = new escpos.Printer(device);
    const dados = req.body;

    device.open((err) => {
      if (err) return res.status(500).json({ error: "Impressora offline" });
      
      printer
        .font('a')
        .align('ct')
        .style('bu')
        .size(2, 2)
        .text('AVAST GRAFICA')
        .size(1, 1)
        .text('Inovamos a sua ideia, so')
        .text('--------------------------------')
        .align('lt')
        .text(\`Via: \${dados.via}\`)
        .text(\`Servico: \${dados.servico}\`)
        .text(\`Total Pago: \${dados.total} MT\`)
        .text(\`Fls: \${dados.pages} | Copias: \${dados.copies}\`)
        .text(\`ID: \${dados.id}\`)
        .text(\`NUIT: \${dados.nuit || '400189422'}\`)
        .text('--------------------------------')
        .cut()
        .close();
        
      res.json({ status: "Impresso com sucesso!" });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => console.log('Agente de Impressão Ativo na Porta 3001'));`}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const code = `const escpos = require('escpos');\nescpos.USB = require('escpos-usb');\nconst express = require('express');\nconst cors = require('cors');\nconst app = express();\n\napp.use(cors());\napp.use(express.json());\n\napp.post('/imprimir-recibo', (req, res) => {\n  try {\n    const device  = new escpos.USB();\n    const printer = new escpos.Printer(device);\n    const dados = req.body;\n\n    device.open((err) => {\n      if (err) return res.status(500).json({ error: "Impressora offline" });\n      \n      printer\n        .font('a')\n        .align('ct')\n        .style('bu')\n        .size(2, 2)\n        .text('AVAST GRAFICA')\n        .size(1, 1)\n        .text('Inovamos a sua ideia, so')\n        .text('--------------------------------')\n        .align('lt')\n        .text(\`Via: \\\${dados.via}\`)\n        .text(\`Servico: \\\${dados.servico}\`)\n        .text(\`Total Pago: \\\${dados.total} MT\`)\n        .text(\`Fls: \\\${dados.pages} | Copias: \\\${dados.copies}\`)\n        .text(\`ID: \\\${dados.id}\`)\n        .text(\`NUIT: \\\${dados.nuit || '400189422'}\`)\n        .text('--------------------------------')\n        .cut()\n        .close();\n        \n      res.json({ status: "Impresso com sucesso!" });\n    });\n  } catch (err) {\n    res.status(500).json({ error: err.message });\n  }\n});\n\napp.listen(3001, () => console.log('Agente de Impressão Ativo na Porta 3001'));`;
                          navigator.clipboard.writeText(code);
                          triggerAlertMessage('📋 Código do Servidor de Impressão ESC/POS copiado para a Área de Transferência!');
                        }}
                        className="py-1.5 bg-brand-gold/15 text-brand-gold border border-brand-gold/30 hover:bg-brand-gold hover:text-brand-teal-deep rounded-xl transition text-[10px] font-bold uppercase tracking-wider text-center"
                      >
                        Copiar Script print-server.js
                      </button>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Comprehensive Ledger List layout */}
            <div className="glass-panel p-6 rounded-3xl flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-brand-gold/10 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Database className="text-brand-orange w-5 h-5" />
                  <h3 className="font-display font-bold text-base text-gray-100 uppercase tracking-wider">
                    Livro Diário de Vendas & Logs do Caixa
                  </h3>
                </div>

                <button
                  onClick={handleClearHistory}
                  className="px-3 py-1.5 rounded-xl border border-brand-red/30 hover:bg-brand-red/10 text-brand-red text-xs font-semibold font-sans transition flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Apagar Livro Diário</span>
                </button>
              </div>

              {history.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <span className="text-3xl block mb-2">📒</span>
                  Nenhum faturamento registado neste terminal automático ainda.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans text-gray-300">
                    <thead>
                      <tr className="border-b border-brand-gold/10 text-brand-gold font-semibold uppercase tracking-wider text-[10px]">
                        <th className="py-3 px-4">Cód. Transação</th>
                        <th className="py-3 px-4">Ficheiro Documento</th>
                        <th className="py-3 px-4">Formato / Cores</th>
                        <th className="py-3 px-4 text-center">Fls / Cópias</th>
                        <th className="py-3 px-4">Contacto Org.</th>
                        <th className="py-3 px-4">Operador</th>
                        <th className="py-3 px-4 text-right">Preço Total</th>
                        <th className="py-3 px-4">Data e Hora</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-gold/5">
                      {history.map((item, idx) => (
                        <tr key={idx} className="hover:bg-brand-teal-mid/20 transition">
                          <td className="py-3.5 px-4 font-mono font-bold text-gray-200">
                            {item.pay.transactionId}
                          </td>
                          <td className="py-3.5 px-4 font-medium text-gray-100 truncate max-w-[200px]" title={item.job.fileName}>
                            {item.job.fileName}
                          </td>
                          <td className="py-3.5 px-4">
                            Papel {item.job.paperSize} ({item.job.colorMode === 'bw' ? 'P&B' : 'Colorido'})
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono font-medium">
                            {item.job.totalPages} pág. × {item.job.copies}
                          </td>
                          <td className="py-3.5 px-4 font-mono">
                            {item.pay.phoneNumber}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              item.pay.operator === 'mpesa' 
                                ? 'bg-brand-red/10 border border-brand-red/20 text-brand-red' 
                                : 'bg-brand-orange/10 border border-brand-orange/20 text-brand-orange'
                            }`}>
                              {item.pay.operator}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-[#f59e0b]">
                            {item.pay.amount.toFixed(2)} MT
                          </td>
                          <td className="py-3.5 px-4 text-gray-400 text-[11px] font-mono whitespace-nowrap">
                            {item.pay.timestamp}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>

          </div>
        )}

      </main>

      {/* Mozambique corporate stamp footer */}
      <footer className="border-t border-brand-gold/10 py-6 bg-brand-teal-deep/95 mt-auto text-xs text-gray-400 font-mono text-center z-10 flex flex-col items-center gap-2" id="main-footer">
        <p>© 2026 AVAST GRÁFICA. Maputo, Moçambique. Todos os direitos reservados.</p>
        <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
          <span>Inovamos a sua ideia, só</span>
          <span>•</span>
          <span>Selo Fiscal de Moçambique</span>
          <Heart className="w-3.5 h-3.5 text-brand-red fill-current inline animate-pulse" />
          <span>para uma impressão rápida e autónoma.</span>
        </div>
      </footer>

    </div>
  );
}
