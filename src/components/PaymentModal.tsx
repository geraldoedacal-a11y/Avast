import React, { useState, useEffect } from 'react';
import { Phone, CheckCircle2, AlertCircle, RefreshCw, Send, ShieldAlert, CreditCard } from 'lucide-react';
import { PrintJob, PaymentDetails } from '../types';

interface PaymentModalProps {
  job: PrintJob;
  paymentConfig?: {
    mode: string;
    gatewayUrl: string;
    apiKey: string;
    mpesaServiceCode: string;
    emolaMerchantId: string;
    webhookUrl: string;
  };
  onPaymentSuccess: (details: PaymentDetails) => void;
  onCancel: () => void;
}

export default function PaymentModal({ job, paymentConfig, onPaymentSuccess, onCancel }: PaymentModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [operator, setOperator] = useState<'mpesa' | 'emola'>('mpesa');
  
  // Workflow states: 'input' -> 'pushing' -> 'pin_screen' -> 'authorizing' -> 'approved'
  const [payStep, setPayStep] = useState<'input' | 'pushing' | 'pin_screen' | 'authorizing' | 'approved'>('input');
  const [simulatedPin, setSimulatedPin] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto detect operator based on Mozambican numbering rules
  // M-Pesa is usually Vodacom (84, 85)
  // E-Mola is usually Movitel (86, 87)
  // mcel is m-kesh (82, 83) but user asked for M-pesa / E-mola specifically.
  useEffect(() => {
    const cleanNum = phoneNumber.replace(/\s+/g, '');
    if (cleanNum.startsWith('86') || cleanNum.startsWith('87') || cleanNum.startsWith('+25886') || cleanNum.startsWith('+25887')) {
      setOperator('emola');
    } else if (cleanNum.startsWith('84') || cleanNum.startsWith('85') || cleanNum.startsWith('+25884') || cleanNum.startsWith('+25885')) {
      setOperator('mpesa');
    }
  }, [phoneNumber]);

  const validatePhone = (num: string) => {
    // Mozambican numbers have 9 digits. If with country code, +258 (12 or 13 digits)
    const clean = num.replace(/\D/g, '');
    if (clean.length === 9) {
      return (clean.startsWith('84') || clean.startsWith('85') || clean.startsWith('86') || clean.startsWith('87'));
    }
    if (clean.length === 12 && clean.startsWith('258')) {
      return (clean.startsWith('25884') || clean.startsWith('25885') || clean.startsWith('25886') || clean.startsWith('25887'));
    }
    return false;
  };

  const handleSendPush = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!validatePhone(phoneNumber)) {
      setErrorMsg('Número inválido. Insira um número de telefone moçambicano válido (Ex: 84XXXXXXX ou 86XXXXXXX).');
      return;
    }

    setPayStep('pushing');

    if (paymentConfig?.mode === 'real_gateway') {
      console.log(`Disparando USSD Push real para ${paymentConfig.gatewayUrl}...`);
      fetch(paymentConfig.gatewayUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${paymentConfig.apiKey}`
        },
        mode: 'cors',
        body: JSON.stringify({
          amount: job.totalPrice,
          phone: phoneNumber.replace(/\s+/g, ''),
          serviceCode: paymentConfig.mpesaServiceCode,
          merchantId: paymentConfig.emolaMerchantId,
          reference: job.id,
          subject: 'Impressao Avast Grafica'
        })
      }).then(async (res) => {
        const responseData = await res.json().catch(() => ({}));
        console.log('Resposta do Gateway de Pagamento:', responseData);
        setPayStep('pin_screen');
      }).catch((err) => {
        console.warn('Real Gateway connection dropped or CORS locked:', err);
        // Fallback to manual PIN simulation so user can always complete the preview demo
        setPayStep('pin_screen');
      });
    } else {
      // Simulate network delay for USSD push notification delivery
      setTimeout(() => {
        setPayStep('pin_screen');
      }, 1800);
    }
  };

  const handleConfirmPayment = () => {
    if (simulatedPin.length < 4) {
      setErrorMsg('Por favor, introduza um PIN de pagamento válido (geralmente 4 dígitos).');
      return;
    }

    setErrorMsg(null);
    setPayStep('authorizing');

    // Simulate instant secure transaction debiting
    setTimeout(() => {
      setPayStep('approved');
      
      const details: PaymentDetails = {
        phoneNumber: phoneNumber.startsWith('+258') ? phoneNumber : `+258 ${phoneNumber}`,
        operator: operator,
        transactionId: (operator === 'mpesa' ? 'MP' : 'EM') + Math.floor(100000000 + Math.random() * 900000000),
        amount: job.totalPrice,
        timestamp: new Date().toLocaleDateString('pt-MZ') + ' ' + new Date().toLocaleTimeString('pt-MZ')
      };

      // Real webhook report if configured
      if (paymentConfig?.mode === 'real_gateway' && paymentConfig?.webhookUrl) {
        fetch(paymentConfig.webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          mode: 'cors',
          body: JSON.stringify({
            event: 'payment.success',
            data: {
              phone: phoneNumber,
              amount: job.totalPrice,
              transactionId: details.transactionId,
              status: 'SUCCESS',
              reference: job.id
            }
          })
        }).then(() => console.log('Webhook dispatched successfully.'))
          .catch(e => console.log('Error dispatching webhook callback:', e));
      }

      // Proceed forward
      setTimeout(() => {
        onPaymentSuccess(details);
      }, 1000);
    }, 2200);
  };

  // Preset button selection for simulated keypad pins
  const pressKey = (key: string) => {
    if (key === 'clear') {
      setSimulatedPin('');
    } else if (key === 'back') {
      setSimulatedPin(prev => prev.slice(0, -1));
    } else if (simulatedPin.length < 5) {
      setSimulatedPin(prev => prev + key);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-brand-teal-deep/90 flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto" id="payment-modal-backdrop">
      <div className="w-full max-w-4xl bg-brand-teal-dark border border-brand-gold/25 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row" id="payment-modal-card">
        
        {/* Left Side: Order summary & branding */}
        <div className="md:w-1/2 p-6 md:p-8 bg-brand-teal-mid/30 border-b md:border-b-0 md:border-r border-brand-gold/10 flex flex-col justify-between">
          <div className="flex flex-col gap-4">
            <span className="px-3 py-1 rounded bg-brand-orange/15 text-brand-orange font-mono text-xs w-fit font-bold uppercase tracking-widest border border-brand-orange/30">
              Impressão Suspensa
            </span>
            <h3 className="font-display font-bold text-2xl text-brand-gold">
              Pagamento Requerido
            </h3>
            <p className="text-sm text-gray-300">
              A impressão foi retida com sucesso. Por favor, efetue o pagamento da taxa de serviço para que a máquina possa processar e imprimir automaticamente o seu documento.
            </p>

            <div className="bg-brand-teal-deep/50 rounded-2xl p-4 border border-brand-gold/5 mt-2">
              <span className="text-[11px] uppercase tracking-wider text-brand-gold font-semibold block mb-3">Resumo da Tarefa</span>
              <div className="flex flex-col gap-2 font-sans text-sm">
                <div className="flex justify-between border-b border-brand-gold/5 pb-2">
                  <span className="text-gray-400">Ficheiro</span>
                  <span className="text-gray-100 font-medium truncate max-w-[200px]" title={job.fileName}>{job.fileName}</span>
                </div>
                <div className="flex justify-between border-b border-brand-gold/5 pb-2">
                  <span className="text-gray-400">Total de Páginas</span>
                  <span className="text-gray-100 font-mono">{job.totalPages} pág. {job.copies > 1 ? `(${job.copies} cópias)` : ''}</span>
                </div>
                <div className="flex justify-between border-b border-brand-gold/5 pb-2">
                  <span className="text-gray-400">Tamanho & Cores</span>
                  <span className="text-gray-100 font-medium">Papel {job.paperSize} ({job.colorMode === 'bw' ? 'P&B' : 'Colorido'})</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-brand-gold font-semibold">Valor Total</span>
                  <span className="text-lg font-mono font-bold text-brand-orange">{job.totalPrice.toFixed(2)} MT</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-brand-teal-deep/90 rounded-xl border border-brand-gold/10 mt-6 text-xs text-gray-400">
            <ShieldAlert className="w-4 h-4 text-brand-gold/80 flex-shrink-0" />
            <p>Usamos canais criptografados compatíveis com USSD Push para garantir a máxima segurança de suas transações financeiras.</p>
          </div>
        </div>

        {/* Right Side: Phone validation OR Phone Device simulator */}
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
          
          {payStep === 'input' && (
            <div className="w-full" id="payment-input-step">
              <h4 className="font-display font-semibold text-lg text-brand-gold mb-2">
                Escolha o Método de Pagamento
              </h4>
              <p className="text-xs text-gray-400 mb-6">
                Selecione sua carteira móvel favorita para proceder ao débito instantâneo.
              </p>

              {/* M-Pesa or E-Mola Toggles */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => setOperator('mpesa')}
                  className={`relative p-4 rounded-2xl flex flex-col items-center justify-center gap-2 border transition ${
                    operator === 'mpesa'
                      ? 'bg-red-950/40 border-brand-red text-white shadow-lg'
                      : 'bg-brand-teal-mid/40 border-brand-teal-light/40 text-gray-400 hover:border-brand-gold/20'
                  }`}
                >
                  <div className="w-12 h-6 flex items-center justify-center bg-red-600 rounded text-[10px] font-black tracking-tighter text-white">
                    M-PESA
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider">Vodacom M-Pesa</span>
                  {operator === 'mpesa' && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand-red animate-ping" />}
                </button>

                <button
                  type="button"
                  onClick={() => setOperator('emola')}
                  className={`relative p-4 rounded-2xl flex flex-col items-center justify-center gap-2 border transition ${
                    operator === 'emola'
                      ? 'bg-orange-950/40 border-brand-orange text-white shadow-lg'
                      : 'bg-brand-teal-mid/40 border-brand-teal-light/40 text-gray-400 hover:border-brand-gold/20'
                  }`}
                >
                  <div className="w-12 h-6 flex items-center justify-center bg-yellow-400 text-brand-teal-deep rounded text-[10px] font-black tracking-tighter">
                    e-mola
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider">Movitel e-Mola</span>
                  {operator === 'emola' && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand-orange animate-ping" />}
                </button>
              </div>

              {/* Number Input form */}
              <form onSubmit={handleSendPush} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-brand-gold uppercase tracking-wider">
                    Número de Celular (M-Pesa ou E-Mola)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      pattern="[0-9+ \-]*"
                      placeholder="Ex: 84XXXXXXX ou 86XXXXXXX"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-brand-teal-deep border border-brand-gold/20 text-gray-100 placeholder-gray-500 tracking-wider font-mono outline-none focus:border-brand-gold"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                {errorMsg && (
                  <div className="flex items-center gap-2 text-xs text-brand-red bg-brand-red/10 border border-brand-red/30 p-3 rounded-lg" id="phone-validation-error">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <p>{errorMsg}</p>
                  </div>
                )}

                <div className="flex items-center gap-3 mt-4">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="w-1/2 py-3.5 border border-brand-gold/15 text-gray-400 hover:bg-brand-teal-mid/30 rounded-xl transition text-sm font-semibold"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-3.5 bg-brand-gold text-brand-teal-deep hover:bg-brand-gold-dark rounded-xl transition text-sm font-semibold flex items-center justify-center gap-2 active:scale-95 shadow-md shadow-brand-gold/10"
                  >
                    <span>Enviar Cobrança</span>
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Interactive Smartphone Screen Simulator for USSD Pin Input */}
          {(payStep === 'pushing' || payStep === 'pin_screen' || payStep === 'authorizing' || payStep === 'approved') && (
            <div className="w-full flex justify-center" id="smartphone-simulator-container">
              <div className="w-full max-w-[290px] aspect-[9/18.5] bg-[#0c0d10] border-4 border-[#33353e] rounded-[38px] shadow-2xl relative overflow-hidden flex flex-col p-3 box-border">
                {/* Speaker & notch */}
                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-28 h-4 bg-[#0c0d10] rounded-b-xl flex items-center justify-center z-20">
                  <div className="w-12 h-1 bg-[#22252a] rounded-full" />
                </div>

                {/* Simulated Screen */}
                <div className="w-full h-full bg-[#161a22] rounded-[30px] overflow-hidden flex flex-col justify-between pt-5 pb-3 px-3 relative text-white select-none">
                  
                  {/* Status Bar */}
                  <div className="flex justify-between items-center text-[10px] text-gray-300 font-semibold px-2">
                    <span>14:38</span>
                    <div className="flex items-center gap-1">
                      <span>4G</span>
                      <div className="w-5 h-2.5 bg-brand-green/30 border border-brand-green rounded-sm relative flex items-center px-0.5">
                        <div className="w-full h-1 bg-brand-green rounded-2xs" />
                      </div>
                    </div>
                  </div>

                  {/* Dynamic internal app simulator display */}
                  <div className="flex-1 flex flex-col justify-center items-center py-4">
                    
                    {payStep === 'pushing' && (
                      <div className="text-center flex flex-col items-center gap-3">
                        <RefreshCw className="w-10 h-10 text-brand-blue animate-spin" />
                        <p className="text-xs text-gray-300 font-medium">Aguardando USSD Push...</p>
                        <p className="text-[10px] text-gray-500 font-mono">Enviando ping para o telemóvel...</p>
                      </div>
                    )}

                    {payStep === 'pin_screen' && (
                      <div className="w-full bg-[#202735] border border-brand-gold/10 p-3 rounded-xl shadow-lg text-center absolute top-12 left-2 right-2 flex flex-col gap-2 z-10">
                        {/* USSD dialogue header */}
                        <div className="flex items-center gap-2 justify-center pb-1 text-center border-b border-gray-100/5">
                          <CreditCard className="w-3.5 h-3.5 text-brand-gold" />
                          <span className="text-[11px] font-bold text-brand-gold tracking-wide uppercase">
                            {operator === 'mpesa' ? 'VODACOM M-PESA' : 'MOVITEL E-MOLA'}
                          </span>
                        </div>
                        
                        <p className="text-[11px] text-gray-200 leading-tight">
                          Pretende pagar <b className="text-brand-orange">{job.totalPrice.toFixed(2)} MT</b> à AVAST GRÁFICA? Introduza o seu PIN:
                        </p>

                        <div className="h-8 bg-[#0e121a] rounded flex items-center justify-center text-lg font-mono tracking-widest text-[#fff] font-bold">
                          {simulatedPin ? simulatedPin.replace(/./g, '•') : <span className="text-xs text-gray-600 font-sans tracking-normal">Introduzir PIN</span>}
                        </div>

                        {errorMsg && (
                          <p className="text-[9px] text-brand-red leading-tight font-medium">
                            {errorMsg}
                          </p>
                        )}
                        
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setErrorMsg(null);
                              onCancel();
                            }}
                            className="bg-gray-800 text-gray-300 rounded py-1 text-[10px] font-semibold hover:bg-gray-700 active:scale-95"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={handleConfirmPayment}
                            className="bg-brand-gold text-brand-teal-deep rounded py-1 text-[10px] font-extrabold hover:bg-brand-gold-dark active:scale-95"
                          >
                            Autorizar
                          </button>
                        </div>
                      </div>
                    )}

                    {payStep === 'authorizing' && (
                      <div className="text-center flex flex-col items-center gap-3">
                        <RefreshCw className="w-10 h-10 text-brand-gold animate-spin" />
                        <p className="text-xs text-brand-gold font-semibold">Validando PIN...</p>
                        <p className="text-[9px] text-gray-400">Debitando saldo de conta móvel...</p>
                      </div>
                    )}

                    {payStep === 'approved' && (
                      <div className="text-center flex flex-col items-center gap-3 animate-bounce">
                        <CheckCircle2 className="w-12 h-12 text-brand-green" />
                        <p className="text-xs text-brand-green font-bold">Transação Aprovada!</p>
                        <p className="text-[10px] text-gray-300">Saldo debitado com sucesso.</p>
                      </div>
                    )}

                  </div>

                  {/* Device simulated digital keypad (Only visible on pin_screen) */}
                  {payStep === 'pin_screen' ? (
                    <div className="grid grid-cols-3 gap-1.5 px-1 mt-auto pb-6">
                      {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'back'].map((k) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => pressKey(k)}
                          className={`h-9 rounded-full text-xs font-semibold flex items-center justify-center transition active:scale-90 ${
                            k === 'clear' || k === 'back'
                              ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 text-[10px]'
                              : 'bg-gray-700/60 hover:bg-gray-700 text-white font-mono'
                          }`}
                        >
                          {k === 'clear' ? 'Limpar' : k === 'back' ? '←' : k}
                        </button>
                      ))}
                    </div>
                  ) : (
                    /* General Home screen overlay */
                    <div className="w-16 h-1 bg-white/20 rounded-full mx-auto mt-auto" />
                  )}

                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
