const PAGES_DATA = {
    'guide': {
        title: 'Guida all\'Uso',
        content: `
            <h2>Procedura d'Uso</h2>
            
            <div class="step">
                <span class="step-number">1</span>
                <strong>Registrazione</strong> - Creare un account e verificare l'email
            </div>
            
            <div class="step">
                <span class="step-number">2</span>
                <strong>Caricamento</strong> - Caricare l'immagine (JPG, PNG, WEBP, max 10MB)
            </div>
            
            <div class="step">
                <span class="step-number">3</span>
                <strong>Istruzioni</strong> - Fornire istruzioni dettagliate in italiano
            </div>
            
            <div class="step">
                <span class="step-number">4</span>
                <strong>Elaborazione</strong> - Il sistema processa automaticamente l'immagine
            </div>
            
            <h2>Esempi di Istruzioni</h2>
            
            <p><strong>Pulizia generale:</strong> "Rimuovere il rumore di sfondo, aumentare il contrasto mantenendo l'autenticità della scrittura"</p>
            
            <p><strong>Correzioni specifiche:</strong> "Pulire aste ascendenti e discendenti, rimuovere macchie di inchiostro senza alterare l'inclinazione"</p>
            
            <p><strong>Riparazione danni:</strong> "Riparare tratti interrotti e rimuovere pieghe della carta mantenendo le caratteristiche originali"</p>
            
            <h2>Funzionalità Principali</h2>
            
            <ul>
                <li>Confronto visuale originale/elaborata</li>
                <li>Zoom per controllo dettagliato</li>
                <li>Modifica iterativa con nuove istruzioni</li>
                <li>Download in alta risoluzione</li>
                <li>Cronologia elaborazioni</li>
                <li>Rimozione automatica metadati EXIF</li>
            </ul>
            
            <div class="warning">
                <div class="warning-title">Note Tecniche</div>
                <ul>
                    <li>Specificare elementi grafologici: pressione, inclinazione, spaziature</li>
                    <li>Utilizzare terminologia tecnica precisa</li>
                    <li>Immagini ottimali: minimo 1200x800px, ben illuminate</li>
                </ul>
            </div>
        `
    },
    'faq': {
        title: 'Domande Frequenti',
        content: `
            <h3>Informazioni Generali</h3>
            
            <p><strong>Cos'è Firma Pulita?</strong><br>
            Servizio di elaborazione AI per migliorare immagini di scritture e firme per l'analisi grafologica professionale.</p>
            
            <p><strong>È gratuito?</strong><br>
            Il servizio richiede registrazione con verifica email. Gli account verificati hanno accesso completo.</p>
            
            <h3>Formati e Qualità</h3>
            
            <p><strong>Formati supportati:</strong> JPG, JPEG, PNG, WEBP (massimo 10MB)</p>
            
            <p><strong>Qualità ottimale:</strong> Minimo 1200x800px, buona illuminazione, scrittura a fuoco</p>
            
            <p><strong>Preservazione caratteristiche grafologiche:</strong> Le istruzioni devono specificare di "mantenere autenticità" e "preservare caratteristiche originali"</p>
            
            <h3>Funzionalità</h3>
            
            <p><strong>Modifica risultati:</strong> Utilizzare "Modifica Ulteriormente" per raffinamenti con nuove istruzioni</p>
            
            <p><strong>Cronologia:</strong> Tutte le elaborazioni sono salvate nel menu utente con data e istruzioni</p>
            
            <p><strong>Tempi di elaborazione:</strong> 30-60 secondi attraverso 4 fasi automatiche</p>
            
            <h3>Privacy e Sicurezza</h3>
            
            <p><strong>Protezione dati:</strong> I metadati EXIF vengono automaticamente rimossi</p>
            
            <p><strong>Cancellazione dati:</strong> Contattare il supporto per richieste di eliminazione</p>
            
            <h3>Risoluzione Problemi</h3>
            
            <p><strong>Server non disponibile:</strong> Attendere alcuni minuti e riprovare</p>
            
            <p><strong>Elaborazione fallisce:</strong> Verificare dimensione file, formato supportato e qualità della connessione</p>
        `
    },
    'examples': {
        title: 'Esempi Pratici',
        content: `
            <h2>Casi d'Uso Professionali</h2>
            
            <h3>Analisi Peritale</h3>
            <p><strong>Problema:</strong> Firma con rumore di scansione</p>
            <p><strong>Istruzione:</strong> "Rimuovere rumore di scansione mantenendo caratteristiche di pressione e velocità"</p>
            
            <h3>Analisi Caratteriale</h3>
            <p><strong>Problema:</strong> Scrittura con macchie di inchiostro</p>
            <p><strong>Istruzione:</strong> "Pulire macchie mantenendo variazioni di pressione e inclinazione"</p>
            
            <h3>Documento Storico</h3>
            <p><strong>Problema:</strong> Lettera antica con pieghe</p>
            <p><strong>Istruzione:</strong> "Rimuovere pieghe e ingiallimento preservando stile calligrafico originale"</p>
            
            <h2>Istruzioni per Situazioni Comuni</h2>
            
            <p><strong>Immagine sfocata:</strong> "Aumentare nitidezza mantenendo proporzioni originali"</p>
            
            <p><strong>Sfondo colorato:</strong> "Isolare scrittura su sfondo bianco preservando colore inchiostro"</p>
            
            <p><strong>Testo sovrapposto:</strong> "Rimuovere testo sottostante preservando integrità della firma"</p>
            
            <p><strong>Riflessi e ombre:</strong> "Eliminare riflessi uniformando illuminazione"</p>
            
            <h2>Tecniche Avanzate</h2>
            
            <p><strong>Modifica iterativa:</strong> Utilizzare "Modifica Ulteriormente" per raffinamenti progressivi - prima pulizia generale, poi elementi specifici, infine dettagli.</p>
            
            <div class="warning">
                <div class="warning-title">Limitazioni</div>
                <ul>
                    <li>Evitare istruzioni generiche</li>
                    <li>Non richiedere alterazioni che compromettano l'autenticità</li>
                    <li>Immagini di partenza devono essere di qualità sufficiente</li>
                </ul>
            </div>
        `
    },
    'contact': {
        title: 'Contatti',
        content: `
            <h2>Assistenza</h2>
            
            <h3>Supporto Tecnico</h3>
            <p>Per problemi tecnici ed errori di elaborazione</p>
            <p><strong>Email:</strong> <a href="mailto:support@firmapulita.com">support@firmapulita.com</a></p>
            <p><strong>Tempo di risposta:</strong> 24 ore (giorni lavorativi)</p>
            
            <h3>Informazioni Generali</h3>
            <p>Domande commerciali e collaborazioni</p>
            <p><strong>Email:</strong> <a href="mailto:info@firmapulita.com">info@firmapulita.com</a></p>
            
            <h3>Feedback</h3>
            <p>Suggerimenti per migliorare il servizio</p>
            <p><strong>Email:</strong> <a href="mailto:feedback@firmapulita.com">feedback@firmapulita.com</a></p>
            
            <h2>Richieste Personalizzate</h2>
            
            <p>Funzionalità specifiche disponibili su richiesta:</p>
            <ul>
                <li>Elaborazione batch multipla</li>
                <li>Formati esportazione personalizzati</li>
                <li>Integrazione software esistenti</li>
                <li>Preset specializzati per tipologia documento</li>
            </ul>
            
            <h2>Disponibilità</h2>
            
            <p><strong>Supporto email:</strong> 24/7 con risposta entro 24 ore lavorative</p>
            <p><strong>Manutenzione:</strong> Occasionali interruzioni notturne programmate</p>
            <p><strong>Aggiornamenti:</strong> Comunicati via email</p>
        `
    },
    'support': {
        title: 'Supporto Tecnico',
        content: `
            <h2>Risoluzione Problemi Comuni</h2>
            
            <h3>Server Non Disponibile</h3>
            <ul>
                <li>Attendere 2-3 minuti e riprovare</li>
                <li>Aggiornare la pagina</li>
                <li>Verificare connessione internet</li>
            </ul>
            
            <h3>Verifica Email Richiesta</h3>
            <ul>
                <li>Controllare posta in arrivo e spam</li>
                <li>Utilizzare il link di verifica nell'email</li>
                <li>Usare "Reinvia Email" se necessario</li>
            </ul>
            
            <h3>Elaborazione Fallisce</h3>
            <ul>
                <li>Verificare dimensione immagine inferiore a 10MB</li>
                <li>Controllare formato supportato (JPG, PNG, WEBP)</li>
                <li>Fornire istruzioni più dettagliate</li>
            </ul>
            
            <h2>Requisiti Tecnici</h2>
            
            <p><strong>Browser supportati:</strong> Chrome 90+, Firefox 88+, Safari 14+, Edge 90+</p>
            
            <p><strong>Configurazione richiesta:</strong> JavaScript e cookie abilitati, connessione stabile</p>
            
            <h2>Ottimizzazione Risultati</h2>
            
            <p><strong>Risultato insoddisfacente:</strong> Utilizzare "Modifica Ulteriormente" con istruzioni più specifiche</p>
            
            <p><strong>Bassa risoluzione:</strong> Caricare immagine originale ad alta risoluzione, preferire PNG a JPG</p>
            
            <div class="warning">
                <div class="warning-title">Informazioni per Supporto</div>
                <p>Prima di contattare il supporto, preparare:</p>
                <ul>
                    <li>Browser e versione</li>
                    <li>Messaggio di errore completo</li>
                    <li>Dimensioni e formato immagine</li>
                    <li>Istruzioni fornite</li>
                </ul>
            </div>
            
            <p><strong>Contatto:</strong> <a href="mailto:support@firmapulita.com">support@firmapulita.com</a></p>
        `
    },
    'feedback': {
        title: 'Feedback',
        content: `
            <h2>Invio Feedback</h2>
            
            <p>Il feedback degli utenti guida lo sviluppo del servizio per soddisfare le esigenze professionali dei grafologi.</p>
            
            <h3>Aree di Interesse</h3>
            
            <p><strong>Qualità risultati:</strong> Soddisfazione professionale, preservazione caratteristiche grafologiche</p>
            
            <p><strong>Usabilità:</strong> Processo intuitivo, chiarezza istruzioni, funzionalità mancanti</p>
            
            <p><strong>Performance:</strong> Tempi elaborazione, stabilità servizio, errori ricorrenti</p>
            
            <h2>Invio</h2>
            
            <p><strong>Email diretta:</strong> <a href="mailto:feedback@firmapulita.com">feedback@firmapulita.com</a></p>
            
            <p><strong>Template feedback:</strong> <a href="mailto:feedback@firmapulita.com?subject=Feedback&body=Valutazione (1-10):%0ACommento:%0AFunzionalità richieste:%0A">Clicca per template pre-compilato</a></p>
            
            <h2>Sviluppi Futuri</h2>
            
            <p>Funzionalità in valutazione:</p>
            <ul>
                <li>Elaborazione batch multipla</li>
                <li>Preset specializzati per tipo documento</li>
                <li>Integrazione API software esistenti</li>
                <li>Formati avanzati (PDF, TIFF)</li>
                <li>Report dettagliato delle modifiche</li>
            </ul>
        `
    },
    'privacy': {
        title: 'Privacy Policy',
        content: `
            <h2>Informazioni sulla Privacy</h2>
            
            <p><strong>Ultimo aggiornamento:</strong> Gennaio 2025</p>
            
            <h3>Dati Raccolti</h3>
            
            <p><strong>Account:</strong> Email, nome display (opzionale), password crittografata</p>
            
            <p><strong>Elaborazione:</strong> Immagini (temporaneamente), istruzioni, cronologia, timestamp</p>
            
            <p><strong>Tecnici:</strong> IP (log temporanei), browser, statistiche uso</p>
            
            <h3>Protezioni Implementate</h3>
            
            <p><strong>Rimozione metadati EXIF:</strong> Automatica per proteggere privacy</p>
            
            <p><strong>Crittografia:</strong> Comunicazioni HTTPS, password protette</p>
            
            <p><strong>Conservazione limitata:</strong> Immagini eliminate entro 24 ore</p>
            
            <p><strong>Nessuna condivisione:</strong> Dati non condivisi con terze parti</p>
            
            <h3>Utilizzo Dati</h3>
            
            <p><strong>Finalità legittime:</strong> Erogazione servizio, cronologia personale, supporto tecnico, miglioramenti (dati aggregati anonimi)</p>
            
            <p><strong>Non utilizzati per:</strong> Marketing, vendita, training AI, analisi contenuto</p>
            
            <h3>Diritti Utente</h3>
            
            <p><strong>Accesso:</strong> Richiesta copia dati account</p>
            
            <p><strong>Modifica:</strong> Aggiornamento dati dalle impostazioni</p>
            
            <p><strong>Cancellazione:</strong> Eliminazione completa account e dati</p>
            
            <p><strong>Portabilità:</strong> Download cronologia in formato leggibile</p>
            
            <h3>Cookie</h3>
            
            <p><strong>Utilizzati:</strong> Autenticazione, preferenze, funzionalità tecniche</p>
            
            <p><strong>Non utilizzati:</strong> Pubblicità, tracking cross-site, analytics invasivi</p>
            
            <p><strong>Contatti privacy:</strong> <a href="mailto:privacy@firmapulita.com">privacy@firmapulita.com</a></p>
        `
    },
    'terms': {
        title: 'Termini di Servizio',
        content: `
            <h2>Condizioni di Utilizzo</h2>
            
            <p><strong>Ultimo aggiornamento:</strong> Gennaio 2025</p>
            
            <h3>Servizio</h3>
            
            <p>Firma Pulita fornisce elaborazione AI di scritture e firme per analisi grafologica professionale, inclusi pulizia automatica, miglioramento contrasto, cronologia e download HD.</p>
            
            <h3>Uso Consentito</h3>
            
            <p><strong>Finalità professionali:</strong> Analisi peritale, consulenze grafologiche, ricerca accademica, preparazione expertise, restauro digitale</p>
            
            <p><strong>Condizioni:</strong> Utilizzo legale, rispetto diritti d'autore, non violazione privacy, uso responsabile</p>
            
            <h3>Uso Vietato</h3>
            
            <p>Espressamente vietati: contraffazione, frode, violazione privacy, uso commerciale indebito, reverse engineering, abuso sistema</p>
            
            <h3>Limitazioni</h3>
            
            <p><strong>Tecniche:</strong> Servizio "as is" senza garanzie assolute, possibili interruzioni manutenzione, limiti dimensione file</p>
            
            <p><strong>Responsabilità utente:</strong> Verificare accuratezza risultati, mantenere confidenzialità, rispettare limiti d'uso</p>
            
            <p><strong>Esclusioni:</strong> Danni indiretti, perdita dati, decisioni basate esclusivamente sui risultati</p>
            
            <h3>Condizioni Economiche</h3>
            
            <p><strong>Attuale:</strong> Registrazione gratuita con verifica email, accesso completo funzionalità</p>
            
            <p><strong>Modifiche future:</strong> Possibili piani premium con preavviso 30 giorni</p>
            
            <h3>Modifiche</h3>
            
            <p>Notifica email per modifiche sostanziali, pubblicazione su questa pagina, uso continuato implica accettazione</p>
            
            <p><strong>Giurisdizione:</strong> Legge italiana, tribunali italiani</p>
            
            <p><strong>Contatto legale:</strong> <a href="mailto:legal@firmapulita.com">legal@firmapulita.com</a></p>
        `
    },
    'about': {
        title: 'Chi Siamo',
        content: `
            <h2>La Nostra Missione</h2>
            
            <p>Firma Pulita fornisce strumenti digitali avanzati per migliorare la qualità delle analisi grafologiche professionali.</p>
            
            <h3>Perché Firma Pulita</h3>
            
            <p><strong>Precisione scientifica:</strong> L'analisi grafologica richiede immagini nitide. La nostra AI elimina imperfezioni preservando caratteristiche autentiche.</p>
            
            <p><strong>Efficienza professionale:</strong> Risultati professionali in minuti, senza software complessi.</p>
            
            <p><strong>Sviluppo italiano:</strong> Creato per grafologi italiani con comprensione specifica delle esigenze del settore.</p>
            
            <h3>Tecnologia</h3>
            
            <p><strong>AI specializzata:</strong> Sistema ottimizzato per documenti e scritture con pipeline multi-step.</p>
            
            <p><strong>Privacy by design:</strong> Rimozione automatica metadati, nessun training su dati utente, eliminazione sicura file temporanei.</p>
            
            <p><strong>Processing intelligente:</strong> Sistema a 4 fasi con fallback automatico per garantire sempre un risultato.</p>
            
            <h3>Team</h3>
            
            <p>Competenze integrate in sviluppo software, consulenza grafologica, user experience e privacy & security conforme GDPR.</p>
            
            <h3>Sviluppi</h3>
            
            <p><strong>Breve termine:</strong> Supporto PDF/TIFF, batch processing, preset specializzati, API integrazione</p>
            
            <p><strong>Long termine:</strong> Standard per preparazione digitale documenti grafologici, supporto digitalizzazione archivi storici</p>
            
            <h3>Collaborazioni</h3>
            
            <p>Aperti a partnership accademiche per digitalizzazione e partnership professionali con studi grafologici per sviluppo funzionalità mirate.</p>
            
            <p><strong>Informazioni:</strong> <a href="mailto:info@firmapulita.com">info@firmapulita.com</a></p>
            
            <p><strong>Partnership:</strong> <a href="mailto:partnership@firmapulita.com">partnership@firmapulita.com</a></p>
            
            <p><strong>© 2025 Firma Pulita - Fatto in Italia</strong></p>
        `
    }
};

if (typeof window !== 'undefined') {
    window.PAGES_DATA = PAGES_DATA;
}