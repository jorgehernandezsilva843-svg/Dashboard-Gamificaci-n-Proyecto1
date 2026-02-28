import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ModalContext = createContext();

export function ModalProvider({ children }) {
    const [modal, setModal] = useState(null);

    const showAlert = useCallback((message, title = 'ALERTA') => {
        return new Promise((resolve) => {
            setModal({
                type: 'alert',
                title,
                message,
                onConfirm: () => {
                    setModal(null);
                    resolve(true);
                }
            });
        });
    }, []);

    const showConfirm = useCallback((message, title = 'CONFIRMAR') => {
        return new Promise((resolve) => {
            setModal({
                type: 'confirm',
                title,
                message,
                onConfirm: () => {
                    setModal(null);
                    resolve(true);
                },
                onCancel: () => {
                    setModal(null);
                    resolve(false);
                }
            });
        });
    }, []);

    return (
        <ModalContext.Provider value={{ showAlert, showConfirm }}>
            {children}
            <AnimatePresence>
                {modal && (
                    <div className="modal-backdrop-fixed" style={{ zIndex: 9999 }}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-panel modal-content-relative"
                            style={{
                                padding: '2rem',
                                width: '90%',
                                maxWidth: '400px',
                                textAlign: 'center',
                                background: 'black',
                                border: 'var(--pixel-border)',
                                boxShadow: 'var(--shadow-retro)'
                            }}
                        >
                            <h2 className="text-gradient" style={{ marginBottom: '1.5rem', textShadow: '2px 2px #000', fontSize: '1.2rem' }}>
                                {modal.title}
                            </h2>
                            <p style={{ color: 'var(--text-primary)', marginBottom: '2rem', fontSize: '0.9rem', lineHeight: '1.6' }}>
                                {modal.message}
                            </p>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                {modal.type === 'confirm' && (
                                    <button className="btn" style={{ background: 'var(--danger)', flex: 1, minWidth: '120px' }} onClick={modal.onCancel}>
                                        [ CANCELAR ]
                                    </button>
                                )}
                                <button className="btn btn-primary" style={{ flex: 1, minWidth: '120px' }} onClick={modal.onConfirm}>
                                    [ ACEPTAR ]
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </ModalContext.Provider>
    );
}

export const useModal = () => useContext(ModalContext);
