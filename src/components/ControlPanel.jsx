import React from 'react';
import { useI18n } from '../i18n';

export default function ControlPanel({
    lkfs, setLkfs,
    sampleRate, setSampleRate,
    bitrate, setBitrate,
    disabled,
    isPro = false
}) {
    const { t } = useI18n();

    return (
        <div className="glass-panel controls">
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '1rem',
                alignItems: 'start'
            }}>

                {/* LKFS Control */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span className="label" style={{ margin: 0, fontSize: '0.85rem' }}>{t('targetLoudness')}</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                                onClick={() => setLkfs('-24')}
                                disabled={disabled}
                                style={{
                                    padding: '2px 6px',
                                    fontSize: '0.7rem',
                                    background: lkfs === '-24' ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)',
                                    border: 'none',
                                    borderRadius: '4px',
                                    color: 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                TV
                            </button>
                            <button
                                onClick={() => setLkfs('-14')}
                                disabled={disabled}
                                style={{
                                    padding: '2px 6px',
                                    fontSize: '0.7rem',
                                    background: lkfs === '-14' ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)',
                                    border: 'none',
                                    borderRadius: '4px',
                                    color: 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                Web
                            </button>
                        </div>
                    </div>
                    <input
                        type="number"
                        placeholder="-14"
                        value={lkfs}
                        onChange={(e) => setLkfs(e.target.value)}
                        onBlur={(e) => {
                            let val = parseFloat(e.target.value);
                            if (isNaN(val)) val = -14;
                            if (val > -5) val = -5;
                            if (val < -70) val = -70;
                            setLkfs(val.toString());
                        }}
                        min="-70"
                        max="-5"
                        disabled={disabled}
                        step="0.1"
                        style={{
                            background: 'rgba(0,0,0,0.3)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            padding: '10px',
                            borderRadius: '8px',
                            color: 'white',
                            width: '100%',
                            fontSize: '1rem',
                            fontFamily: 'JetBrains Mono, monospace',
                            boxSizing: 'border-box'
                        }}
                    />
                    <p style={{ fontSize: '0.7rem', color: '#888', marginTop: '6px' }}>
                        -70 〜 -5 LKFS
                    </p>
                </div>

                {/* Sampling Rate */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span className="label" style={{ margin: 0, fontSize: '0.85rem' }}>{t('samplingRate')}</span>
                        {!isPro && (
                            <span style={{
                                fontSize: '0.65rem',
                                color: '#ff9800',
                                background: 'rgba(255, 152, 0, 0.2)',
                                padding: '2px 4px',
                                borderRadius: '4px'
                            }}>
                                {t('proOnly')}
                            </span>
                        )}
                    </div>
                    <select
                        value={isPro ? sampleRate : ''}
                        onChange={(e) => setSampleRate(e.target.value)}
                        disabled={disabled || !isPro}
                        style={{
                            background: 'rgba(0,0,0,0.3)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            padding: '10px',
                            borderRadius: '8px',
                            color: isPro ? 'white' : 'rgba(255,255,255,0.5)',
                            width: '100%',
                            cursor: isPro ? 'pointer' : 'not-allowed',
                            boxSizing: 'border-box',
                            opacity: isPro ? 1 : 0.6
                        }}
                    >
                        <option value="">{t('original')}</option>
                        {isPro && (
                            <>
                                <option value="44100">44.1 kHz</option>
                                <option value="48000">48 kHz</option>
                                <option value="96000">96 kHz</option>
                            </>
                        )}
                    </select>
                    <p style={{ fontSize: '0.7rem', color: isPro ? '#888' : '#ff9800', marginTop: '6px' }}>
                        {isPro ? t('samplingRateNote') : t('samplingRateProNote')}
                    </p>
                </div>

                {/* Bitrate */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span className="label" style={{ margin: 0, fontSize: '0.85rem' }}>{t('bitrate')}</span>
                        {!isPro && (
                            <span style={{
                                fontSize: '0.65rem',
                                color: '#ff9800',
                                background: 'rgba(255, 152, 0, 0.2)',
                                padding: '2px 4px',
                                borderRadius: '4px'
                            }}>
                                {t('proOnly')}
                            </span>
                        )}
                    </div>
                    <select
                        value={isPro ? bitrate : ''}
                        onChange={(e) => setBitrate(e.target.value)}
                        disabled={disabled || !isPro}
                        style={{
                            background: 'rgba(0,0,0,0.3)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            padding: '10px',
                            borderRadius: '8px',
                            color: isPro ? 'white' : 'rgba(255,255,255,0.5)',
                            width: '100%',
                            cursor: isPro ? 'pointer' : 'not-allowed',
                            boxSizing: 'border-box',
                            opacity: isPro ? 1 : 0.6
                        }}
                    >
                        <option value="">{t('vbrAuto')}</option>
                        {isPro && (
                            <>
                                <option value="128k">CBR 128 kbps</option>
                                <option value="192k">CBR 192 kbps</option>
                                <option value="256k">CBR 256 kbps</option>
                                <option value="320k">CBR 320 kbps</option>
                            </>
                        )}
                    </select>
                    <p style={{ fontSize: '0.7rem', color: isPro ? '#888' : '#ff9800', marginTop: '6px' }}>
                        {isPro ? t('bitrateNote') : t('bitrateProNote')}
                    </p>
                </div>

            </div>
        </div>
    );
}
