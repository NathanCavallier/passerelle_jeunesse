export default function MentionsLegales() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Mentions Légales
            </h1>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">
              Informations légales et réglementaires
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-4xl prose prose-slate dark:prose-invert">
          <h2>1. Identification de l'éditeur</h2>
          <p>
            Le site <strong>jeunesse.imogo.org</strong> est édité par :
          </p>
          <div className="ml-6">
            <p>
              <strong>Passerelle Jeunesse</strong><br />
              Auto-entreprise exploitée par Nathan Imogo<br />
              SIRET : <em>[À compléter lors de l'immatriculation]</em><br />
              Adresse : <em>[Votre adresse professionnelle]</em><br />
              Email : <a href="mailto:contact@imogo.org">contact@imogo.org</a><br />
              Téléphone : 06 12 34 56 78
            </p>
          </div>

          <h2>2. Directeur de la publication</h2>
          <p>
            Le directeur de la publication du site est <strong>Nathan Imogo</strong>, 
            en sa qualité d'exploitant de l'auto-entreprise.
          </p>

          <h2>3. Hébergement du site</h2>
          <p>
            Le site est hébergé par :
          </p>
          <div className="ml-6">
            <p>
              <strong>Google LLC (Firebase Hosting)</strong><br />
              1600 Amphitheatre Parkway<br />
              Mountain View, CA 94043<br />
              États-Unis<br />
              Site web : <a href="https://firebase.google.com" target="_blank" rel="noopener noreferrer">firebase.google.com</a>
            </p>
          </div>

          <h2>4. Protection des données personnelles (RGPD)</h2>
          
          <h3>4.1 Responsable du traitement</h3>
          <p>
            Le responsable du traitement des données personnelles est <strong>Nathan Imogo</strong>, 
            exploitant de Passerelle Jeunesse.
          </p>

          <h3>4.2 Données collectées</h3>
          <p>
            Dans le cadre de nos prestations d'accompagnement, nous sommes amenés à collecter les données suivantes :
          </p>
          <ul>
            <li><strong>Données du parent/tuteur</strong> : nom, prénom, adresse, téléphone, email, pièce d'identité</li>
            <li><strong>Données du jeune</strong> : nom, prénom, date de naissance, photo (optionnelle), pièce d'identité</li>
            <li><strong>Données sensibles</strong> : allergies, traitements médicaux, numéro de sécurité sociale (pour urgences uniquement)</li>
            <li><strong>Données de navigation</strong> : adresse IP, cookies, pages visitées</li>
          </ul>

          <h3>4.3 Finalité du traitement</h3>
          <p>
            Les données collectées sont utilisées pour :
          </p>
          <ul>
            <li>L'exécution de la prestation d'accompagnement</li>
            <li>La sécurité du jeune</li>
            <li>La communication avec les parents</li>
            <li>La gestion administrative et comptable</li>
            <li>Le respect des obligations légales</li>
          </ul>

          <h3>4.4 Base légale</h3>
          <p>
            Le traitement des données repose sur :
          </p>
          <ul>
            <li>L'exécution du contrat de prestation</li>
            <li>Le consentement explicite des parents</li>
            <li>L'intérêt légitime (sécurité du jeune)</li>
            <li>Les obligations légales</li>
          </ul>

          <h3>4.5 Durée de conservation</h3>
          <ul>
            <li><strong>Données contractuelles</strong> : 10 ans (obligations comptables)</li>
            <li><strong>Données médicales sensibles</strong> : suppression immédiate après la prestation</li>
            <li><strong>Archives comptables</strong> : conservation selon obligations légales</li>
            <li><strong>Cookies</strong> : 13 mois maximum</li>
          </ul>

          <h3>4.6 Vos droits</h3>
          <p>
            Conformément au RGPD, vous disposez des droits suivants :
          </p>
          <ul>
            <li><strong>Droit d'accès</strong> : obtenir une copie de vos données</li>
            <li><strong>Droit de rectification</strong> : corriger vos données inexactes</li>
            <li><strong>Droit à l'effacement</strong> : supprimer vos données (sauf obligations légales)</li>
            <li><strong>Droit d'opposition</strong> : refuser un traitement spécifique</li>
            <li><strong>Droit à la portabilité</strong> : récupérer vos données dans un format structuré</li>
            <li><strong>Droit de limitation</strong> : restreindre temporairement un traitement</li>
          </ul>
          <p>
            Pour exercer ces droits, contactez-nous à : <a href="mailto:contact@imogo.org">contact@imogo.org</a>
          </p>
          <p>
            Vous disposez également du droit de déposer une réclamation auprès de la CNIL : 
            <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">www.cnil.fr</a>
          </p>

          <h3>4.7 Sécurité des données</h3>
          <p>
            Nous mettons en œuvre toutes les mesures techniques et organisationnelles pour protéger vos données :
          </p>
          <ul>
            <li>Chiffrement des données sensibles</li>
            <li>Accès restreint et authentifié</li>
            <li>Sauvegardes régulières</li>
            <li>Hébergement sécurisé (Firebase - Google Cloud)</li>
          </ul>

          <h2>5. Cookies</h2>
          
          <h3>5.1 Qu'est-ce qu'un cookie ?</h3>
          <p>
            Un cookie est un petit fichier texte déposé sur votre appareil lors de la visite d'un site web. 
            Il permet de mémoriser des informations sur votre navigation.
          </p>

          <h3>5.2 Cookies utilisés sur ce site</h3>
          <ul>
            <li><strong>Cookies essentiels</strong> : nécessaires au fonctionnement du site (connexion, panier, sécurité)</li>
            <li><strong>Cookies analytiques</strong> : mesure d'audience anonymisée (Google Analytics)</li>
            <li><strong>Cookies fonctionnels</strong> : amélioration de l'expérience utilisateur (préférences langue, thème)</li>
          </ul>

          <h3>5.3 Gestion des cookies</h3>
          <p>
            Vous pouvez gérer vos préférences de cookies à tout moment via les paramètres de votre navigateur :
          </p>
          <ul>
            <li><strong>Chrome</strong> : Paramètres &gt; Confidentialité et sécurité &gt; Cookies</li>
            <li><strong>Firefox</strong> : Options &gt; Vie privée et sécurité &gt; Cookies</li>
            <li><strong>Safari</strong> : Préférences &gt; Confidentialité &gt; Cookies</li>
            <li><strong>Edge</strong> : Paramètres &gt; Cookies et autorisations de site</li>
          </ul>

          <h2>6. Propriété intellectuelle</h2>
          <p>
            L'ensemble du contenu du site <strong>jeunesse.imogo.org</strong> (textes, images, logos, vidéos, structure) 
            est la propriété exclusive de Passerelle Jeunesse, sauf mention contraire.
          </p>
          <p>
            Toute reproduction, représentation, modification ou adaptation, totale ou partielle, 
            est strictement interdite sans autorisation écrite préalable.
          </p>

          <h2>7. Liens hypertextes</h2>
          <p>
            Le site peut contenir des liens vers des sites externes. Passerelle Jeunesse n'exerce aucun contrôle 
            sur ces sites et décline toute responsabilité quant à leur contenu.
          </p>

          <h2>8. Limitation de responsabilité</h2>
          <p>
            Passerelle Jeunesse s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur ce site. 
            Toutefois, nous ne pouvons garantir l'absence d'erreurs ou d'omissions.
          </p>
          <p>
            Nous déclinons toute responsabilité en cas de :
          </p>
          <ul>
            <li>Indisponibilité temporaire du site</li>
            <li>Virus ou attaques informatiques</li>
            <li>Dommages directs ou indirects résultant de l'utilisation du site</li>
          </ul>

          <h2>9. Droit applicable</h2>
          <p>
            Les présentes mentions légales sont régies par le droit français. 
            Tout litige sera soumis aux tribunaux compétents de Metz.
          </p>

          <h2>10. Crédits</h2>
          <ul>
            <li><strong>Développement & Design</strong> : Nathan Imogo</li>
            <li><strong>Framework</strong> : Next.js 15 (React)</li>
            <li><strong>UI Components</strong> : Shadcn/UI + Tailwind CSS</li>
            <li><strong>Hébergement</strong> : Firebase Hosting (Google Cloud)</li>
            <li><strong>Icons</strong> : Lucide React</li>
          </ul>

          <h2>11. Contact</h2>
          <p>
            Pour toute question concernant ces mentions légales ou la protection de vos données :
          </p>
          <div className="ml-6">
            <p>
              <strong>Passerelle Jeunesse</strong><br />
              Nathan Imogo<br />
              Email : <a href="mailto:contact@imogo.org">contact@imogo.org</a><br />
              Téléphone : 06 12 34 56 78<br />
              Site web : <a href="https://jeunesse.imogo.org">jeunesse.imogo.org</a>
            </p>
          </div>

          <div className="mt-12 p-6 bg-muted rounded-lg">
            <p className="text-sm text-center">
              <strong>Dernière mise à jour :</strong> 12 février 2026
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
