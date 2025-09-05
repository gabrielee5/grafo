const PAGES_DATA = {
    'guide': {
        title: 'Guida all\'Uso',
        content: `
            <p>Benvenuto in <strong>Firma Pulita</strong>, lo strumento innovativo progettato specificamente per grafologi professionisti. Questa guida ti accompagnerà attraverso tutte le funzionalità del servizio per ottenere i migliori risultati dalle tue analisi grafologiche.</p>
            
            <h2>🚀 Primi Passi</h2>
            
            <div class="step">
                <span class="step-number">1</span>
                <strong>Registrazione e Accesso</strong>
                <p>Per iniziare, clicca sul pulsante "Accedi" in alto a destra. Se è la prima volta, seleziona "Registrati" per creare il tuo account professionale.</p>
            </div>
            
            <div class="step">
                <span class="step-number">2</span>
                <strong>Verifica Email</strong>
                <p>Dopo la registrazione, verifica la tua email per accedere a tutte le funzionalità avanzate del servizio.</p>
            </div>
            
            <h2>📸 Caricamento e Preparazione delle Scritture</h2>
            
            <h3>Formati Supportati</h3>
            <ul>
                <li><strong>JPG/JPEG</strong> - Ideale per foto scattate con smartphone</li>
                <li><strong>PNG</strong> - Perfetto per scansioni ad alta qualità</li>
                <li><strong>WEBP</strong> - Formato moderno con ottima compressione</li>
            </ul>
            
            <div class="tip">
                <div class="tip-title">💡 Suggerimento</div>
                <p>Per risultati ottimali, usa immagini con risoluzione di almeno 1200x800 pixel e assicurati che la scrittura sia ben illuminata e in focus.</p>
            </div>
            
            <h3>Come Caricare un'Immagine</h3>
            <div class="step">
                <span class="step-number">1</span>
                <strong>Metodo Drag & Drop</strong>
                <p>Trascina semplicemente il file nell'area di caricamento centrale.</p>
            </div>
            
            <div class="step">
                <span class="step-number">2</span>
                <strong>Selezione File</strong>
                <p>Clicca sull'area di caricamento e seleziona il file dal tuo dispositivo.</p>
            </div>
            
            <h2>✍️ Istruzioni per l'Elaborazione</h2>
            
            <p>La chiave per ottenere risultati eccellenti è fornire <strong>istruzioni dettagliate e specifiche</strong>. Il nostro sistema di AI comprende richieste complesse e può adattarsi alle tue esigenze professionali.</p>
            
            <h3>Esempi di Istruzioni Efficaci</h3>
            
            <div class="step">
                <strong>Per Analisi Generale:</strong>
                <p>"Pulisci questa firma rimuovendo completamente il rumore di sfondo, aumenta il contrasto per evidenziare le caratteristiche della pressione, e migliora la definizione dei tratti mantenendo l'autenticità della scrittura."</p>
            </div>
            
            <div class="step">
                <strong>Per Focus su Specifici Elementi:</strong>
                <p>"Concentrati sulla pulizia delle aste ascendenti e discendenti, rimuovi le macchie di inchiostro e uniforma lo spessore del tratto senza alterare l'inclinazione naturale della scrittura."</p>
            </div>
            
            <div class="step">
                <strong>Per Scritture Danneggiate:</strong>
                <p>"Ripara i tratti interrotti, rimuovi le pieghe della carta, correggi le sbavature mantenendo intatte le caratteristiche grafologiche originali come pressione e dinamismo."</p>
            </div>
            
            <h2>⚡ Processo di Elaborazione</h2>
            
            <p>Una volta avviata l'elaborazione, il sistema esegue questi passaggi:</p>
            
            <div class="step">
                <span class="step-number">1</span>
                <strong>Validazione</strong>
                <p>Verifica della qualità dell'immagine e delle istruzioni fornite.</p>
            </div>
            
            <div class="step">
                <span class="step-number">2</span>
                <strong>Traduzione</strong>
                <p>Le istruzioni vengono ottimizzate per il sistema di elaborazione AI.</p>
            </div>
            
            <div class="step">
                <span class="step-number">3</span>
                <strong>Ottimizzazione</strong>
                <p>Il prompt viene migliorato tecnicamente per massimizzare la qualità del risultato.</p>
            </div>
            
            <div class="step">
                <span class="step-number">4</span>
                <strong>Elaborazione</strong>
                <p>L'AI processa l'immagine seguendo le istruzioni ottimizzate.</p>
            </div>
            
            <h2>📊 Analisi dei Risultati</h2>
            
            <p>Al termine dell'elaborazione, avrai accesso a:</p>
            
            <ul>
                <li><strong>Confronto Visuale</strong> - Visualizzazione side-by-side dell'originale e del risultato elaborato</li>
                <li><strong>Controlli di Zoom</strong> - Per esaminare i dettagli migliorati</li>
                <li><strong>Download HD</strong> - Scarica l'immagine migliorata in alta risoluzione</li>
                <li><strong>Modifica Ulteriore</strong> - Possibilità di rifinire il risultato con nuove istruzioni</li>
            </ul>
            
            <h2>🔄 Funzionalità Avanzate</h2>
            
            <h3>Cronologia Elaborazioni</h3>
            <p>Accedi alla cronologia completa delle tue elaborazioni dal menu utente. Ogni elaborazione viene salvata con:</p>
            <ul>
                <li>Data e ora dell'elaborazione</li>
                <li>Istruzioni utilizzate</li>
                <li>Risultato finale</li>
                <li>Possibilità di riutilizzare le istruzioni</li>
            </ul>
            
            <h3>Modifica Iterativa</h3>
            <p>Usa il pulsante "Modifica Ulteriormente" per perfezionare gradualmente il risultato con istruzioni aggiuntive specifiche.</p>
            
            <div class="warning">
                <div class="warning-title">⚠️ Importante</div>
                <p>Le elaborazioni sono limitate per account. Registrati e verifica la tua email per accedere al servizio completo.</p>
            </div>
            
            <h2>🎯 Suggerimenti per Grafologi</h2>
            
            <div class="tip">
                <div class="tip-title">📝 Best Practice</div>
                <ul>
                    <li>Specifica sempre il tipo di analisi che intendi condurre</li>
                    <li>Menziona elementi grafologici specifici (pressione, inclinazione, spaziature)</li>
                    <li>Richiedi la conservazione di caratteristiche autentiche importanti</li>
                    <li>Utilizza terminologia tecnica grafologica nelle istruzioni</li>
                </ul>
            </div>
            
            <p>Per ulteriore assistenza o domande specifiche, contattaci attraverso il link "Supporto Tecnico" nel footer.</p>
        `
    },
    'faq': {
        title: 'Domande Frequenti',
        content: '<p>Contenuto FAQ in arrivo...</p>'
    },
    'examples': {
        title: 'Esempi e Casi di Studio',
        content: '<p>Esempi in arrivo...</p>'
    },
    'contact': {
        title: 'Contatti',
        content: '<p>Informazioni di contatto in arrivo...</p>'
    },
    'support': {
        title: 'Supporto Tecnico',
        content: '<p>Informazioni di supporto in arrivo...</p>'
    },
    'feedback': {
        title: 'Invia Feedback',
        content: '<p>Modulo feedback in arrivo...</p>'
    },
    'privacy': {
        title: 'Privacy Policy',
        content: '<p>Privacy policy in arrivo...</p>'
    },
    'terms': {
        title: 'Termini di Servizio',
        content: '<p>Termini di servizio in arrivo...</p>'
    },
    'about': {
        title: 'Chi Siamo',
        content: '<p>Informazioni sul progetto in arrivo...</p>'
    }
};

if (typeof window !== 'undefined') {
    window.PAGES_DATA = PAGES_DATA;
}