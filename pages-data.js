const PAGES_DATA = {
    'guide': {
        title: 'Guida all\'Uso',
        content: `
            <h2>🚀 Iniziare</h2>
            
            <div class="step">
                <span class="step-number">1</span>
                <strong>Registrati</strong> - Crea un account e verifica la tua email
            </div>
            
            <div class="step">
                <span class="step-number">2</span>
                <strong>Carica</strong> - Trascina l'immagine o clicca per selezionare (JPG, PNG, WEBP, max 10MB)
            </div>
            
            <div class="step">
                <span class="step-number">3</span>
                <strong>Descrivi</strong> - Scrivi istruzioni dettagliate in italiano
            </div>
            
            <div class="step">
                <span class="step-number">4</span>
                <strong>Elabora</strong> - L'AI pulisce la scrittura in 4 passaggi automatici
            </div>
            
            <h2>✍️ Esempi di Istruzioni Efficaci</h2>
            
            <div class="tip">
                <strong>Pulizia generale:</strong><br>
                "Rimuovi il rumore di sfondo, aumenta il contrasto e migliora la definizione mantenendo l'autenticità della scrittura"
            </div>
            
            <div class="tip">
                <strong>Focus elementi specifici:</strong><br>
                "Pulisci aste ascendenti e discendenti, rimuovi macchie di inchiostro, uniforma spessore senza alterare inclinazione"
            </div>
            
            <div class="tip">
                <strong>Riparazione danni:</strong><br>
                "Ripara tratti interrotti, rimuovi pieghe carta, correggi sbavature mantenendo pressione e dinamismo originali"
            </div>
            
            <h2>🔧 Funzionalità</h2>
            
            <ul>
                <li><strong>Confronto visuale</strong> - Originale vs elaborata side-by-side</li>
                <li><strong>Zoom dettagliato</strong> - Esamina i miglioramenti da vicino</li>
                <li><strong>Modifica iterativa</strong> - Rifinisci il risultato con nuove istruzioni</li>
                <li><strong>Download HD</strong> - Scarica l'immagine pulita in alta risoluzione</li>
                <li><strong>Cronologia</strong> - Accedi alle tue elaborazioni precedenti</li>
                <li><strong>Privacy</strong> - Metadati EXIF rimossi automaticamente</li>
            </ul>
            
            <div class="warning">
                <div class="warning-title">💡 Suggerimenti per Grafologi</div>
                <ul>
                    <li>Specifica elementi grafologici: pressione, inclinazione, spaziature</li>
                    <li>Richiedi conservazione delle caratteristiche autentiche</li>
                    <li>Usa terminologia tecnica nelle istruzioni</li>
                    <li>Immagini ottimali: 1200x800px, ben illuminate, a fuoco</li>
                </ul>
            </div>
        `
    },
    'faq': {
        title: 'Domande Frequenti',
        content: `
            <h3>📋 Generale</h3>
            
            <div class="faq-item">
                <strong>Q: Cos'è Firma Pulita?</strong><br>
                A: Un servizio AI per grafologi che pulisce e migliora automaticamente immagini di scritture e firme per facilitare l'analisi grafologica.
            </div>
            
            <div class="faq-item">
                <strong>Q: È gratuito?</strong><br>
                A: Il servizio richiede registrazione e verifica email. Account verificati hanno accesso completo alle funzionalità.
            </div>
            
            <h3>🖼️ Immagini</h3>
            
            <div class="faq-item">
                <strong>Q: Quali formati sono supportati?</strong><br>
                A: JPG, JPEG, PNG, WEBP fino a 10MB di dimensione.
            </div>
            
            <div class="faq-item">
                <strong>Q: Qual è la qualità ottimale?</strong><br>
                A: Minimo 1200x800px, buona illuminazione, scrittura a fuoco, contrasto sufficiente.
            </div>
            
            <div class="faq-item">
                <strong>Q: L'AI altera le caratteristiche grafologiche?</strong><br>
                A: No, se istruita correttamente. Specifica sempre di "mantenere autenticità", "preservare pressione" e "conservare caratteristiche originali".
            </div>
            
            <h3>🔧 Funzionalità</h3>
            
            <div class="faq-item">
                <strong>Q: Posso modificare il risultato?</strong><br>
                A: Sì, usa "Modifica Ulteriormente" per raffinare con nuove istruzioni specifiche.
            </div>
            
            <div class="faq-item">
                <strong>Q: Le mie elaborazioni vengono salvate?</strong><br>
                A: Sì, nella cronologia accessibile dal menu utente. Include data, istruzioni usate e risultato.
            </div>
            
            <div class="faq-item">
                <strong>Q: Quanto tempo richiede l'elaborazione?</strong><br>
                A: Solitamente 30-60 secondi. Il sistema passa attraverso 4 fasi automatiche: validazione, traduzione, ottimizzazione, elaborazione.
            </div>
            
            <h3>🔒 Privacy</h3>
            
            <div class="faq-item">
                <strong>Q: I miei dati sono al sicuro?</strong><br>
                A: Sì. I metadati EXIF vengono automaticamente rimossi dalle immagini per proteggere la privacy.
            </div>
            
            <div class="faq-item">
                <strong>Q: Posso eliminare la cronologia?</strong><br>
                A: Contatta il supporto per richieste di cancellazione dati.
            </div>
            
            <h3>⚠️ Problemi</h3>
            
            <div class="faq-item">
                <strong>Q: "Backend server non disponibile"?</strong><br>
                A: Il servizio è temporaneamente non raggiungibile. Riprova tra qualche minuto o contatta il supporto.
            </div>
            
            <div class="faq-item">
                <strong>Q: L'elaborazione fallisce sempre?</strong><br>
                A: Verifica: immagine < 10MB, formato supportato, istruzioni dettagliate, connessione stabile.
            </div>
        `
    },
    'examples': {
        title: 'Esempi e Casi di Studio',
        content: `
            <h2>🎯 Casi d'Uso per Grafologi</h2>
            
            <div class="example-case">
                <h3>📝 Analisi Peritale</h3>
                <p><strong>Scenario:</strong> Firma su documento legale con rumore di scansione</p>
                <p><strong>Istruzioni:</strong> "Rimuovi completamente il rumore di scansione e le imperfezioni della carta, aumenta il contrasto della firma mantenendo intatte le caratteristiche di pressione e velocità di esecuzione"</p>
                <p><strong>Risultato:</strong> Firma nitida per analisi dettagliata di autenticità</p>
            </div>
            
            <div class="example-case">
                <h3>🔍 Analisi Caratteriale</h3>
                <p><strong>Scenario:</strong> Scrittura corsiva con macchie di inchiostro</p>
                <p><strong>Istruzioni:</strong> "Pulisci le macchie di inchiostro e le sbavature, mantieni visibili le variazioni di pressione e l'inclinazione naturale delle lettere per l'analisi grafologica"</p>
                <p><strong>Risultato:</strong> Testo pulito con caratteristiche grafologiche intatte</p>
            </div>
            
            <div class="example-case">
                <h3>📄 Documento Storico</h3>
                <p><strong>Scenario:</strong> Lettera antica con pieghe e ingiallimento</p>
                <p><strong>Istruzioni:</strong> "Rimuovi le pieghe della carta e l'ingiallimento, ripara i tratti interrotti mantenendo lo stile calligrafico originale e le caratteristiche dell'epoca"</p>
                <p><strong>Risultato:</strong> Scrittura storica leggibile per analisi paleografica</p>
            </div>
            
            <h2>✍️ Esempi di Istruzioni per Situazioni Comuni</h2>
            
            <div class="instruction-example">
                <strong>Foto da smartphone sfocata:</strong><br>
                "Aumenta la nitidezza e definizione dei tratti, correggi la sfocatura mantenendo le proporzioni originali della scrittura"
            </div>
            
            <div class="instruction-example">
                <strong>Scrittura su sfondo colorato:</strong><br>
                "Isola la scrittura dallo sfondo colorato, crea sfondo bianco uniforme preservando il colore originale dell'inchiostro"
            </div>
            
            <div class="instruction-example">
                <strong>Firma sovrapposta ad altro testo:</strong><br>
                "Rimuovi il testo sottostante mantenendo solo la firma, pulisci le sovrapposizioni preservando l'integrità del tratto della firma"
            </div>
            
            <div class="instruction-example">
                <strong>Scrittura con riflessi o ombre:</strong><br>
                "Elimina riflessi e ombre dalla superficie del foglio, uniforma l'illuminazione mantenendo il contrasto naturale dell'inchiostro"
            </div>
            
            <h2>🔧 Tecniche Avanzate</h2>
            
            <div class="tip">
                <div class="tip-title">🎯 Modifica Iterativa</div>
                <p>Usa il pulsante "Modifica Ulteriormente" per raffinamenti specifici:</p>
                <ul>
                    <li>Prima elaborazione: pulizia generale</li>
                    <li>Seconda elaborazione: focus su elementi specifici</li>
                    <li>Terza elaborazione: rifinitura dettagli</li>
                </ul>
            </div>
            
            <div class="warning">
                <div class="warning-title">⚠️ Cosa Evitare</div>
                <ul>
                    <li>Istruzioni generiche tipo "migliora l'immagine"</li>
                    <li>Richiedere alterazioni che compromettano l'autenticità</li>
                    <li>Caricare immagini troppo piccole o molto sfocate</li>
                    <li>Aspettarsi miracoli su scritture estremamente danneggiate</li>
                </ul>
            </div>
        `
    },
    'contact': {
        title: 'Contatti',
        content: `
            <h2>📧 Contattaci</h2>
            
            <div class="contact-info">
                <h3>🛠️ Supporto Tecnico</h3>
                <p>Per problemi tecnici, errori di elaborazione o domande sull'uso del servizio.</p>
                <p><strong>Email:</strong> <a href="mailto:support@firmapulita.com">support@firmapulita.com</a></p>
                <p><strong>Risposta tipica:</strong> Entro 24 ore nei giorni lavorativi</p>
            </div>
            
            <div class="contact-info">
                <h3>💼 Informazioni Generali</h3>
                <p>Per domande commerciali, collaborazioni o informazioni sul servizio.</p>
                <p><strong>Email:</strong> <a href="mailto:info@firmapulita.com">info@firmapulita.com</a></p>
            </div>
            
            <div class="contact-info">
                <h3>📱 Feedback e Suggerimenti</h3>
                <p>Le tue opinioni ci aiutano a migliorare il servizio per tutti i grafologi.</p>
                <p><strong>Email:</strong> <a href="mailto:feedback@firmapulita.com">feedback@firmapulita.com</a></p>
                <p>Usa anche il modulo feedback dal footer del sito.</p>
            </div>
            
            <h2>🚀 Richiedi Funzionalità</h2>
            
            <div class="tip">
                <p>Hai bisogno di funzionalità specifiche per il tuo lavoro di grafologo?</p>
                <ul>
                    <li>Elaborazione batch di multiple immagini</li>
                    <li>Formati di esportazione specifici</li>
                    <li>Integrazione con software di analisi</li>
                    <li>Preset per tipologie di documenti</li>
                </ul>
                <p>Contattaci per discutere implementazioni personalizzate.</p>
            </div>
            
            <h2>⏰ Orari di Assistenza</h2>
            
            <div class="warning">
                <div class="warning-title">🕐 Disponibilità</div>
                <ul>
                    <li><strong>Supporto Email:</strong> 24/7 (risposta entro 24h lavorative)</li>
                    <li><strong>Manutenzione Sistema:</strong> Occasionali interruzioni notturne</li>
                    <li><strong>Aggiornamenti:</strong> Comunicati via email agli utenti registrati</li>
                </ul>
            </div>
            
            <p><strong>Servizio sviluppato in Italia per grafologi professionisti</strong></p>
        `
    },
    'support': {
        title: 'Supporto Tecnico',
        content: `
            <h2>🔧 Risoluzione Problemi</h2>
            
            <div class="support-section">
                <h3>❌ Errori Comuni</h3>
                
                <div class="problem-solution">
                    <strong>🚫 "Backend server non disponibile"</strong>
                    <ul>
                        <li>Attendi 2-3 minuti e riprova</li>
                        <li>Aggiorna la pagina (F5 o Ctrl+R)</li>
                        <li>Controlla la connessione internet</li>
                        <li>Se persiste: contatta supporto</li>
                    </ul>
                </div>
                
                <div class="problem-solution">
                    <strong>📧 "Verifica la tua email per utilizzare il servizio"</strong>
                    <ul>
                        <li>Controlla posta in arrivo e spam</li>
                        <li>Clicca sul link di verifica nell'email</li>
                        <li>Usa "Reinvia Email" se necessario</li>
                        <li>Controlla di aver inserito l'email corretta</li>
                    </ul>
                </div>
                
                <div class="problem-solution">
                    <strong>⚠️ Elaborazione fallisce o si blocca</strong>
                    <ul>
                        <li>Verifica dimensione immagine < 10MB</li>
                        <li>Controlla formato (JPG, PNG, WEBP)</li>
                        <li>Scrivi istruzioni più dettagliate</li>
                        <li>Prova con immagine di qualità migliore</li>
                    </ul>
                </div>
            </div>
            
            <div class="support-section">
                <h3>💻 Requisiti Browser</h3>
                
                <div class="tip">
                    <strong>Browser Supportati:</strong>
                    <ul>
                        <li>Chrome 90+ (Consigliato)</li>
                        <li>Firefox 88+</li>
                        <li>Safari 14+</li>
                        <li>Edge 90+</li>
                    </ul>
                </div>
                
                <div class="tip">
                    <strong>Configurazione Ottimale:</strong>
                    <ul>
                        <li>JavaScript abilitato</li>
                        <li>Cookie abilitati</li>
                        <li>Connessione stabile (elaborazione richiede 30-60s)</li>
                        <li>Popup blocker disabilitato per il sito</li>
                    </ul>
                </div>
            </div>
            
            <div class="support-section">
                <h3>📊 Ottimizzazione Risultati</h3>
                
                <div class="problem-solution">
                    <strong>🎯 Risultato non soddisfacente</strong>
                    <ul>
                        <li>Usa "Modifica Ulteriormente" con istruzioni più specifiche</li>
                        <li>Specifica elementi grafologici da preservare</li>
                        <li>Indica chiaramente cosa NON modificare</li>
                        <li>Prova con immagine di partenza migliore</li>
                    </ul>
                </div>
                
                <div class="problem-solution">
                    <strong>📷 Immagine finale pixelata</strong>
                    <ul>
                        <li>Carica immagine originale ad alta risoluzione</li>
                        <li>Evita immagini già compresse multiple volte</li>
                        <li>Usa PNG invece di JPG se possibile</li>
                    </ul>
                </div>
            </div>
            
            <div class="support-section">
                <h3>🏥 Diagnostica Avanzata</h3>
                
                <div class="warning">
                    <div class="warning-title">🔍 Prima di Contattare il Supporto</div>
                    <p>Raccogli queste informazioni:</p>
                    <ul>
                        <li>Browser e versione utilizzati</li>
                        <li>Messaggio di errore esatto</li>
                        <li>Dimensione e formato immagine</li>
                        <li>Istruzioni inserite</li>
                        <li>Orario del problema</li>
                        <li>Se il problema è intermittente o costante</li>
                    </ul>
                </div>
            </div>
            
            <p><strong>📧 Supporto:</strong> <a href="mailto:support@firmapulita.com">support@firmapulita.com</a></p>
            <p>Risposta tipica entro 24 ore nei giorni lavorativi</p>
        `
    },
    'feedback': {
        title: 'Invia Feedback',
        content: `
            <h2>💬 Il Tuo Feedback è Prezioso</h2>
            
            <p>Firma Pulita è sviluppato <strong>per grafologi, da grafologi</strong>. Le tue opinioni guidano lo sviluppo del servizio.</p>
            
            <div class="feedback-section">
                <h3>🎯 Cosa Ci Interessa</h3>
                
                <div class="feedback-category">
                    <strong>✨ Qualità Risultati</strong>
                    <ul>
                        <li>I risultati soddisfano le tue esigenze professionali?</li>
                        <li>Le caratteristiche grafologiche vengono preservate?</li>
                        <li>Ci sono tipologie di documenti che non vengono processate bene?</li>
                    </ul>
                </div>
                
                <div class="feedback-category">
                    <strong>🛠️ Usabilità</strong>
                    <ul>
                        <li>Il processo è intuitivo e veloce?</li>
                        <li>Le istruzioni sono chiare?</li>
                        <li>Mancano funzionalità che ti servirebbero?</li>
                    </ul>
                </div>
                
                <div class="feedback-category">
                    <strong>⚡ Performance</strong>
                    <ul>
                        <li>I tempi di elaborazione sono accettabili?</li>
                        <li>Il servizio è stabile e affidabile?</li>
                        <li>Hai riscontrato errori ricorrenti?</li>
                    </ul>
                </div>
            </div>
            
            <div class="feedback-section">
                <h3>📝 Come Inviare Feedback</h3>
                
                <div class="contact-method">
                    <strong>📧 Email Diretta</strong><br>
                    <a href="mailto:feedback@firmapulita.com?subject=Feedback%20Firma%20Pulita">feedback@firmapulita.com</a><br>
                    <small>Includi dettagli specifici e suggerimenti concreti</small>
                </div>
                
                <div class="contact-method">
                    <strong>🔗 Modulo Rapido</strong><br>
                    <a href="mailto:feedback@firmapulita.com?subject=Feedback%20Rapido&body=Valutazione%20(1-10):%0AComentio:%0AFunzionalità%20richieste:%0A">Clicca per aprire template email</a><br>
                    <small>Template pre-compilato per feedback veloce</small>
                </div>
            </div>
            
            <div class="feedback-section">
                <h3>🚀 Roadmap Sviluppo</h3>
                
                <div class="tip">
                    <div class="tip-title">🔮 Prossime Funzionalità (In Valutazione)</div>
                    <ul>
                        <li><strong>Batch Processing:</strong> Elaborazione simultanea di più documenti</li>
                        <li><strong>Preset Specializzati:</strong> Configurazioni ottimizzate per tipo documento</li>
                        <li><strong>Analisi Automatica:</strong> Suggerimenti automatici di pulizia</li>
                        <li><strong>Integrazione API:</strong> Collegamento con software di analisi</li>
                        <li><strong>Formati Avanzati:</strong> Supporto PDF, TIFF ad alta risoluzione</li>
                        <li><strong>Report Elaborazione:</strong> Log dettagliato delle modifiche applicate</li>
                    </ul>
                </div>
                
                <p><strong>Vota le priorità!</strong> Indica quali funzionalità ti servirebbero di più nel tuo lavoro quotidiano.</p>
            </div>
            
            <div class="feedback-section">
                <h3>⭐ Testimonianze</h3>
                
                <div class="warning">
                    <div class="warning-title">💼 Grafologo Professionista?</div>
                    <p>Se Firma Pulita ti ha aiutato nel tuo lavoro professionale, considera di condividere la tua esperienza:</p>
                    <ul>
                        <li>Testimonianze per il sito web</li>
                        <li>Casi di studio anonimi</li>
                        <li>Suggerimenti per altri colleghi</li>
                    </ul>
                    <p>Aiutaci a far conoscere il servizio nella comunità grafologica italiana!</p>
                </div>
            </div>
            
            <p><em>Ogni feedback viene letto e considerato personalmente. Grazie per contribuire al miglioramento del servizio!</em></p>
        `
    },
    'privacy': {
        title: 'Privacy Policy',
        content: `
            <h2>🔒 Protezione della Privacy</h2>
            
            <p><strong>Ultimo aggiornamento:</strong> Gennaio 2025</p>
            
            <div class="privacy-section">
                <h3>📋 Informazioni Raccolte</h3>
                
                <div class="data-category">
                    <strong>🔐 Dati Account</strong>
                    <ul>
                        <li>Email address (per autenticazione)</li>
                        <li>Nome display (opzionale)</li>
                        <li>Password (crittografata)</li>
                        <li>Stato verifica email</li>
                    </ul>
                </div>
                
                <div class="data-category">
                    <strong>📸 Dati Elaborazione</strong>
                    <ul>
                        <li>Immagini caricate (temporaneamente per elaborazione)</li>
                        <li>Istruzioni fornite</li>
                        <li>Cronologia elaborazioni</li>
                        <li>Timestamp attività</li>
                    </ul>
                </div>
                
                <div class="data-category">
                    <strong>📊 Dati Tecnici</strong>
                    <ul>
                        <li>IP address (log temporanei)</li>
                        <li>Tipo browser e versione</li>
                        <li>Statistiche uso servizio</li>
                    </ul>
                </div>
            </div>
            
            <div class="privacy-section">
                <h3>🛡️ Protezioni Implementate</h3>
                
                <div class="protection-measure">
                    <strong>🧹 Rimozione Metadati EXIF</strong><br>
                    Tutti i metadati delle immagini (posizione GPS, info fotocamera, timestamp) vengono automaticamente rimossi per proteggere la tua privacy.
                </div>
                
                <div class="protection-measure">
                    <strong>🔒 Crittografia Dati</strong><br>
                    Comunicazioni HTTPS, password crittografate, dati sensibili protetti con standard industriali.
                </div>
                
                <div class="protection-measure">
                    <strong>⏰ Conservazione Limitata</strong><br>
                    Immagini temporaneamente processate vengono eliminate entro 24 ore. Cronologia account conservata per funzionalità servizio.
                </div>
                
                <div class="protection-measure">
                    <strong>🚫 Nessuna Condivisione</strong><br>
                    Le tue immagini e dati NON vengono mai condivisi con terze parti o utilizzati per training AI.
                </div>
            </div>
            
            <div class="privacy-section">
                <h3>🎯 Utilizzo Dati</h3>
                
                <div class="usage-purpose">
                    <strong>✅ Usi Consentiti</strong>
                    <ul>
                        <li>Fornire il servizio di pulizia immagini</li>
                        <li>Mantenere cronologia personale</li>
                        <li>Supporto tecnico quando richiesto</li>
                        <li>Miglioramenti servizio (dati aggregati anonimi)</li>
                        <li>Comunicazioni relative al servizio</li>
                    </ul>
                </div>
                
                <div class="usage-purpose">
                    <strong>❌ NON Utilizziamo Dati Per</strong>
                    <ul>
                        <li>Marketing o pubblicità</li>
                        <li>Vendita a terze parti</li>
                        <li>Training di modelli AI</li>
                        <li>Analisi contenuto immagini (solo elaborazione)</li>
                    </ul>
                </div>
            </div>
            
            <div class="privacy-section">
                <h3>🔧 I Tuoi Diritti</h3>
                
                <div class="user-right">
                    <strong>📋 Accesso Dati</strong><br>
                    Puoi richiedere copia di tutti i dati associati al tuo account.
                </div>
                
                <div class="user-right">
                    <strong>✏️ Modifica Dati</strong><br>
                    Aggiorna nome e email dalle impostazioni account.
                </div>
                
                <div class="user-right">
                    <strong>🗑️ Cancellazione</strong><br>
                    Richiedi eliminazione completa account e dati associati.
                </div>
                
                <div class="user-right">
                    <strong>📤 Portabilità</strong><br>
                    Scarica la tua cronologia elaborazioni in formato leggibile.
                </div>
            </div>
            
            <div class="privacy-section">
                <h3>🍪 Cookie e Tracking</h3>
                
                <div class="tip">
                    <strong>Cookie Utilizzati:</strong>
                    <ul>
                        <li><strong>Autenticazione:</strong> Mantenere sessione login</li>
                        <li><strong>Preferenze:</strong> Impostazioni interface utente</li>
                        <li><strong>Tecnici:</strong> Funzionalità del sito</li>
                    </ul>
                    <p><strong>NON utilizziamo:</strong> Cookie pubblicitari, tracking cross-site, analytics invasivi</p>
                </div>
            </div>
            
            <div class="warning">
                <div class="warning-title">📞 Contatti Privacy</div>
                <p><strong>Domande sulla privacy:</strong> <a href="mailto:privacy@firmapulita.com">privacy@firmapulita.com</a></p>
                <p><strong>Richieste GDPR:</strong> Risposta entro 30 giorni</p>
                <p><strong>Responsabile Dati:</strong> Disponibile per chiarimenti</p>
            </div>
            
            <p><em>Servizio sviluppato nel rispetto del GDPR e normative italiane sulla privacy</em></p>
        `
    },
    'terms': {
        title: 'Termini di Servizio',
        content: `
            <h2>📋 Termini di Utilizzo</h2>
            
            <p><strong>Ultimo aggiornamento:</strong> Gennaio 2025</p>
            <p><strong>Entrata in vigore:</strong> Accettazione automatica all'uso del servizio</p>
            
            <div class="terms-section">
                <h3>🎯 Servizio Fornito</h3>
                
                <div class="service-description">
                    <p><strong>Firma Pulita</strong> fornisce elaborazione AI di immagini contenenti scritture e firme per scopi di analisi grafologica professionale.</p>
                    
                    <div class="tip">
                        <strong>Servizi Inclusi:</strong>
                        <ul>
                            <li>Pulizia automatica immagini scritture</li>
                            <li>Rimozione rumore e imperfezioni</li>
                            <li>Miglioramento contrasto e nitidezza</li>
                            <li>Cronologia elaborazioni personale</li>
                            <li>Download risultati in alta risoluzione</li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <div class="terms-section">
                <h3>✅ Uso Consentito</h3>
                
                <div class="allowed-usage">
                    <strong>🎓 Usi Professionali Consentiti</strong>
                    <ul>
                        <li>Analisi grafologica peritale</li>
                        <li>Consulenze grafologiche</li>
                        <li>Ricerca accademica in grafologia</li>
                        <li>Preparazione documenti per expertise</li>
                        <li>Restauro digitale per conservazione</li>
                    </ul>
                </div>
                
                <div class="allowed-usage">
                    <strong>📋 Condizioni d'Uso</strong>
                    <ul>
                        <li>Utilizzo per scopi legali e legittimi</li>
                        <li>Rispetto dei diritti d'autore sui documenti</li>
                        <li>Non violazione privacy terzi</li>
                        <li>Uso responsabile delle funzionalità</li>
                    </ul>
                </div>
            </div>
            
            <div class="terms-section">
                <h3>🚫 Uso Vietato</h3>
                
                <div class="warning">
                    <div class="warning-title">❌ È Espressamente Vietato</div>
                    <ul>
                        <li><strong>Contraffazione:</strong> Creare o migliorare documenti falsi</li>
                        <li><strong>Frode:</strong> Alterare firme per scopi fraudolenti</li>
                        <li><strong>Violazione Privacy:</strong> Elaborare documenti senza autorizzazione</li>
                        <li><strong>Uso Commerciale Indebito:</strong> Rivendere il servizio senza autorizzazione</li>
                        <li><strong>Reverse Engineering:</strong> Tentare di copiare la tecnologia</li>
                        <li><strong>Abuso Sistema:</strong> Sovracaricare o compromettere l'infrastruttura</li>
                    </ul>
                </div>
            </div>
            
            <div class="terms-section">
                <h3>⚖️ Limitazioni e Responsabilità</h3>
                
                <div class="limitation-item">
                    <strong>🔧 Limitazioni Tecniche</strong>
                    <ul>
                        <li>Servizio fornito "as is" senza garanzie assolute</li>
                        <li>Risultati possono variare in base a qualità input</li>
                        <li>Possibili interruzioni per manutenzione</li>
                        <li>Limiti su dimensione file (10MB) e formati supportati</li>
                    </ul>
                </div>
                
                <div class="limitation-item">
                    <strong>📊 Responsabilità Utente</strong>
                    <ul>
                        <li>Verificare accuratezza risultati per uso professionale</li>
                        <li>Mantenere confidenzialità documenti sensibili</li>
                        <li>Rispettare limiti d'uso del servizio</li>
                        <li>Non fare affidamento esclusivo per decisioni critiche</li>
                    </ul>
                </div>
                
                <div class="limitation-item">
                    <strong>🛡️ Esclusioni di Responsabilità</strong>
                    <ul>
                        <li>Danni indiretti o conseguenziali</li>
                        <li>Perdita di dati per cause tecniche</li>
                        <li>Decisioni basate esclusivamente sui risultati</li>
                        <li>Uso improprio o non autorizzato del servizio</li>
                    </ul>
                </div>
            </div>
            
            <div class="terms-section">
                <h3>💳 Condizioni Economiche</h3>
                
                <div class="pricing-info">
                    <strong>🆓 Servizio Attuale</strong>
                    <ul>
                        <li>Registrazione gratuita con verifica email</li>
                        <li>Accesso completo funzionalità base</li>
                        <li>Elaborazioni illimitate per account verificati</li>
                    </ul>
                </div>
                
                <div class="pricing-info">
                    <strong>🔮 Modifiche Future</strong>
                    <ul>
                        <li>Possibili piani premium con funzionalità avanzate</li>
                        <li>Preavviso di 30 giorni per cambi significativi</li>
                        <li>Grandfathering per utenti esistenti quando possibile</li>
                    </ul>
                </div>
            </div>
            
            <div class="terms-section">
                <h3>🔄 Modifiche Termini</h3>
                
                <div class="tip">
                    <div class="tip-title">📢 Aggiornamenti</div>
                    <ul>
                        <li>Notifica via email per modifiche sostanziali</li>
                        <li>Pubblicazione sulla presente pagina</li>
                        <li>Uso continuato implica accettazione</li>
                        <li>Diritto di cessare utilizzo in caso di disaccordo</li>
                    </ul>
                </div>
            </div>
            
            <div class="warning">
                <div class="warning-title">⚖️ Giurisdizione</div>
                <p><strong>Legge Applicabile:</strong> Repubblica Italiana</p>
                <p><strong>Foro Competente:</strong> Tribunali italiani</p>
                <p><strong>Controversie:</strong> Tentativo conciliazione prima di azioni legali</p>
                <p><strong>Contatto Legale:</strong> <a href="mailto:legal@firmapulita.com">legal@firmapulita.com</a></p>
            </div>
            
            <p><em>Accettando questi termini, confermi di essere un professionista qualificato che utilizza il servizio per scopi legittimi di analisi grafologica.</em></p>
        `
    },
    'about': {
        title: 'Chi Siamo',
        content: `
            <h2>🎯 La Nostra Missione</h2>
            
            <p><strong>Firma Pulita</strong> nasce per rispondere a una necessità concreta della comunità grafologica italiana: avere strumenti digitali all'avanguardia per migliorare la qualità delle analisi grafologiche.</p>
            
            <div class="mission-section">
                <h3>✨ Perché Firma Pulita</h3>
                
                <div class="reason-item">
                    <strong>🔬 Precisione Scientifica</strong><br>
                    L'analisi grafologica richiede immagini nitide e pulite. Imperfezioni, rumore e difetti di scansione possono compromettere l'accuratezza dell'analisi. La nostra AI elimina questi ostacoli preservando le caratteristiche grafologiche autentiche.
                </div>
                
                <div class="reason-item">
                    <strong>⏱️ Efficienza Professionale</strong><br>
                    Invece di perdere tempo con software di editing complessi, i grafologi possono ottenere risultati professionali in pochi minuti, concentrandosi su ciò che sanno fare meglio: l'analisi.
                </div>
                
                <div class="reason-item">
                    <strong>🇮🇹 Sviluppo Italiano</strong><br>
                    Creato in Italia, per grafologi italiani. Comprendiamo le specifiche esigenze del mercato nazionale e la terminologia specialistica del settore.
                </div>
            </div>
            
            <div class="technology-section">
                <h3>🤖 La Tecnologia</h3>
                
                <div class="tech-feature">
                    <strong>🧠 AI Specializzata</strong><br>
                    Non utilizziamo AI generiche. Il nostro sistema è ottimizzato specificamente per documento e scritture, con pipeline di elaborazione multi-step che garantiscono risultati professionali.
                </div>
                
                <div class="tech-feature">
                    <strong>🔒 Privacy by Design</strong><br>
                    Rimozione automatica metadati EXIF, nessun training su dati utente, eliminazione sicura file temporanei. La riservatezza è integrata nel design del servizio.
                </div>
                
                <div class="tech-feature">
                    <strong>⚡ Processing Intelligente</strong><br>
                    Sistema a 4 fasi: validazione input, traduzione ottimizzata, enhancement tecnico, elaborazione finale. Con fallback automatico per garantire sempre un risultato.
                </div>
            </div>
            
            <div class="team-section">
                <h3>👥 Il Team</h3>
                
                <div class="tip">
                    <div class="tip-title">🛠️ Competenze Integrate</div>
                    <ul>
                        <li><strong>Sviluppo Software:</strong> Esperienza in AI, computer vision, web development</li>
                        <li><strong>Consulenza Grafologica:</strong> Collaborazione con professionisti del settore</li>
                        <li><strong>User Experience:</strong> Design centrato sulle esigenze reali degli utenti</li>
                        <li><strong>Privacy & Security:</strong> Conformità GDPR e best practices sicurezza</li>
                    </ul>
                </div>
            </div>
            
            <div class="vision-section">
                <h3>🚀 Vision e Sviluppi</h3>
                
                <div class="future-goal">
                    <strong>📈 Obiettivi a Breve Termine</strong>
                    <ul>
                        <li>Espandere il supporto formati (PDF, TIFF)</li>
                        <li>Implementare batch processing per studi con volumi elevati</li>
                        <li>Creare preset specializzati per tipologie documento</li>
                        <li>Sviluppare API per integrazione software esistenti</li>
                    </ul>
                </div>
                
                <div class="future-goal">
                    <strong>🎯 Vision a Lungo Termine</strong>
                    <ul>
                        <li>Diventare lo standard de facto per la preparazione digitale documenti grafologici</li>
                        <li>Supportare la digitalizzazione degli archivi grafologici storici</li>
                        <li>Contribuire all'avanzamento scientifico della grafologia con strumenti tecnologici</li>
                    </ul>
                </div>
            </div>
            
            <div class="community-section">
                <h3>🤝 Comunità e Collaborazioni</h3>
                
                <div class="collaboration">
                    <strong>🎓 Collaborazioni Accademiche</strong><br>
                    Aperti a partnership con università e istituti di ricerca per progetti di digitalizzazione e analisi automatica di documenti storici.
                </div>
                
                <div class="collaboration">
                    <strong>💼 Partnership Professionali</strong><br>
                    Collaboriamo con studi grafologici e professionisti per comprendere meglio le esigenze reali e sviluppare funzionalità mirate.
                </div>
                
                <div class="collaboration">
                    <strong>🔬 Ricerca e Sviluppo</strong><br>
                    Investiamo costantemente in R&D per rimanere all'avanguardia nelle tecnologie di image processing e AI applicata alla grafologia.
                </div>
            </div>
            
            <div class="warning">
                <div class="warning-title">📞 Contattaci</div>
                <p><strong>Informazioni generali:</strong> <a href="mailto:info@firmapulita.com">info@firmapulita.com</a></p>
                <p><strong>Collaborazioni:</strong> <a href="mailto:partnership@firmapulita.com">partnership@firmapulita.com</a></p>
                <p><strong>Media e stampa:</strong> <a href="mailto:press@firmapulita.com">press@firmapulita.com</a></p>
            </div>
            
            <p><em>"Tecnologia al servizio dell'analisi grafologica italiana"</em></p>
            
            <p><strong>© 2025 Firma Pulita - Made in Italy</strong></p>
        `
    }
};

if (typeof window !== 'undefined') {
    window.PAGES_DATA = PAGES_DATA;
}