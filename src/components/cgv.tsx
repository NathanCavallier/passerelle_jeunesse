export default function CGV() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Conditions Générales de Vente
            </h1>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">
              Dernière mise à jour : 12 février 2026
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-4xl prose prose-slate dark:prose-invert">
          <h2>Article 1 – Objet</h2>
          <p>
            Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre
            <strong> Passerelle Jeunesse</strong>, auto-entreprise exploitée par Nathan Imogo, et toute personne
            physique ou morale souhaitant bénéficier des services d'accompagnement de jeunes.
          </p>
          <p>
            Toute commande ou réservation de prestation implique l'acceptation sans réserve des présentes CGV.
          </p>

          <h2>Article 2 – Services proposés</h2>
          <p>Passerelle Jeunesse propose les services suivants :</p>
          <ul>
            <li><strong>Accompagnement local</strong> : trajets domicile-école, activités, rendez-vous (Metz et Saint-Avold)</li>
            <li><strong>Accompagnement longue distance</strong> : voyages en train ou bus dans toute la France</li>
            <li><strong>Accompagnements réguliers</strong> : forfaits hebdomadaires ou mensuels sur mesure</li>
          </ul>
          <p>
            Les services sont destinés aux jeunes âgés de 7 à 20 ans. Les modalités spécifiques de chaque prestation
            sont détaillées dans le contrat ou devis établi pour chaque mission.
          </p>

          <h2>Article 3 – Tarifs</h2>
          <p>
            Les tarifs sont indiqués en euros TTC. Ils sont valables au moment de la commande et peuvent être révisés à tout moment.
            Les tarifs appliqués sont ceux en vigueur au moment de la réservation.
          </p>
          <p><strong>Tarifs indicatifs :</strong></p>
          <ul>
            <li>Accompagnement local : 25€/h à 85€/demi-journée</li>
            <li>Accompagnement longue distance : 120€ à 320€ selon durée et complexité</li>
            <li>Supplément pour jeunes supplémentaires : tarif dégressif communiqué au devis</li>
          </ul>
          <p>
            Les frais de transport de l'accompagnateur sont inclus dans le tarif.
            Les billets de transport pour le(s) jeune(s) accompagné(s) restent à la charge du client.
          </p>

          <h2>Article 4 – Réservation et validation</h2>
          <p>
            Toute réservation doit être effectuée au minimum :
          </p>
          <ul>
            <li>48 heures à l'avance pour un accompagnement local</li>
            <li>7 jours à l'avance pour un accompagnement longue distance</li>
          </ul>
          <p>
            La réservation est validée après :
          </p>
          <ol>
            <li>Réception du devis signé</li>
            <li>Réception de l'autorisation parentale signée</li>
            <li>Réception de la fiche de renseignements complète</li>
            <li>Réception de l'acompte (le cas échéant)</li>
          </ol>

          <h2>Article 5 – Modalités de paiement</h2>
          <p><strong>Moyens de paiement acceptés :</strong></p>
          <ul>
            <li>Virement bancaire</li>
            <li>Chèque</li>
            <li>Espèces (dans la limite légale)</li>
          </ul>
          <p><strong>Échéancier :</strong></p>
          <ul>
            <li><strong>Accompagnement local</strong> : paiement intégral avant ou après la prestation</li>
            <li><strong>Accompagnement longue distance</strong> :
              <ul>
                <li>Acompte de 30% à la réservation</li>
                <li>Solde dû 48h avant la prestation</li>
              </ul>
            </li>
          </ul>
          <p>
            Toute prestation commencée est due dans son intégralité. En cas de retard de paiement,
            des pénalités de 3 fois le taux d'intérêt légal s'appliqueront automatiquement.
          </p>

          <h2>Article 6 – Annulation et modification</h2>
          <h3>6.1 Annulation par le client</h3>
          <ul>
            <li><strong>Plus de 7 jours avant</strong> : remboursement intégral</li>
            <li><strong>Entre 7 et 3 jours avant</strong> : remboursement de 50%</li>
            <li><strong>Moins de 3 jours avant</strong> : aucun remboursement</li>
          </ul>
          <p>
            Exception : en cas de force majeure dûment justifiée (maladie avec certificat médical, décès, catastrophe naturelle),
            un remboursement total ou report de la prestation pourra être accordé.
          </p>

          <h3>6.2 Annulation par Passerelle Jeunesse</h3>
          <p>
            En cas d'annulation de notre fait (maladie, impossibilité), nous nous engageons à :
          </p>
          <ul>
            <li>Vous prévenir dans les plus brefs délais</li>
            <li>Vous proposer une solution de remplacement si possible</li>
            <li>Vous rembourser intégralement si aucune solution n'est trouvée</li>
          </ul>

          <h3>6.3 Modification</h3>
          <p>
            Toute modification de date, heure ou itinéraire doit être demandée au minimum 48h avant la prestation.
            Selon la faisabilité, elle pourra être acceptée sans frais ou moyennant un supplément.
          </p>

          <h2>Article 7 – Documents obligatoires</h2>
          <p>
            Pour toute prestation, les documents suivants sont obligatoires :
          </p>
          <ol>
            <li><strong>Autorisation parentale</strong> signée des deux parents (ou du représentant légal)</li>
            <li><strong>Fiche de renseignements</strong> complète (contacts d'urgence, allergies, traitements médicaux, numéro de sécurité sociale)</li>
            <li><strong>Copie de la pièce d'identité</strong> du jeune</li>
            <li><strong>Billets de transport</strong> (pour les trajets longue distance)</li>
          </ol>
          <p>
            Sans ces documents, Passerelle Jeunesse se réserve le droit de refuser la prestation sans remboursement.
          </p>

          <h2>Article 8 – Responsabilités</h2>
          <h3>8.1 Responsabilité de Passerelle Jeunesse</h3>
          <p>
            Passerelle Jeunesse s'engage à :
          </p>
          <ul>
            <li>Assurer la sécurité du jeune pendant toute la durée de la mission</li>
            <li>Respecter l'itinéraire et les horaires convenus</li>
            <li>Informer les parents en cas d'imprévu ou de retard</li>
            <li>Disposer d'une assurance Responsabilité Civile Professionnelle</li>
          </ul>
          <p>
            Notre responsabilité est limitée à la période effective d'accompagnement,
            de la prise en charge à la remise en main propre à l'adulte désigné.
          </p>

          <h3>8.2 Responsabilité du client</h3>
          <p>
            Le client s'engage à :
          </p>
          <ul>
            <li>Fournir des informations exactes et complètes</li>
            <li>Signaler tout problème de santé, allergie ou besoin spécifique</li>
            <li>Préparer le jeune au trajet (comportement, consignes)</li>
            <li>Être joignable pendant toute la durée de la prestation</li>
            <li>Être présent ou mandater un adulte identifié pour la prise en charge et la remise du jeune</li>
          </ul>

          <h3>8.3 Limites de responsabilité</h3>
          <p>
            Passerelle Jeunesse ne peut être tenu responsable :
          </p>
          <ul>
            <li>Des retards imputables aux compagnies de transport</li>
            <li>Des grèves ou mouvements sociaux</li>
            <li>Des conditions météorologiques exceptionnelles</li>
            <li>Du comportement du jeune hors de notre contrôle</li>
            <li>Des objets de valeur non déclarés et perdus</li>
          </ul>

          <h2>Article 9 – Assurances</h2>
          <p>
            Passerelle Jeunesse dispose d'une assurance Responsabilité Civile Professionnelle couvrant l'ensemble de ses activités.
          </p>
          <p>
            Le jeune reste couvert par l'assurance de ses parents. Nous recommandons vivement une assurance
            "individuelle accidents" pour toute activité impliquant des déplacements.
          </p>

          <h2>Article 10 – Données personnelles (RGPD)</h2>
          <p>
            Conformément au Règlement Général sur la Protection des Données (RGPD), les informations collectées
            sont nécessaires à l'exécution de la prestation et sont destinées exclusivement à Passerelle Jeunesse.
          </p>
          <p>
            Vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition au traitement de vos données.
            Pour exercer ces droits : <a href="mailto:contact@passerellejeunesse.fr">contact@passerellejeunesse.fr</a>
          </p>
          <p>
            Les données sont conservées pendant la durée nécessaire à la prestation, puis archivées selon les obligations légales.
          </p>

          <h2>Article 11 – Confidentialité</h2>
          <p>
            Passerelle Jeunesse s'engage à traiter de manière strictement confidentielle toutes les informations
            relatives au jeune et à sa famille.
          </p>

          <h2>Article 12 – Droit à l'image</h2>
          <p>
            Sauf opposition écrite des parents, Passerelle Jeunesse peut prendre des photos de confirmation
            (départ/arrivée, visage flouté) uniquement pour information des parents.
          </p>
          <p>
            Aucune photo ne sera utilisée à des fins commerciales ou publiques sans autorisation écrite préalable.
          </p>

          <h2>Article 13 – Litiges</h2>
          <p>
            En cas de litige, nous privilégions une résolution amiable. Le client peut d'abord nous contacter directement.
          </p>
          <p>
            En cas d'échec, le client peut recourir à une médiation de la consommation auprès de :
          </p>
          <p className="ml-6">
            <strong>Médiateur de la consommation</strong><br />
            CNPM – Médiation de la consommation<br />
            27 avenue de la Libération<br />
            42400 Saint-Chamond<br />
            <a href="https://cnpm-mediation-consommation.eu">cnpm-mediation-consommation.eu</a>
          </p>
          <p>
            À défaut d'accord amiable, tout litige sera soumis aux tribunaux compétents de Metz.
          </p>

          <h2>Article 14 – Droit applicable</h2>
          <p>
            Les présentes CGV sont régies par le droit français. Toute clause déclarée nulle n'affecte pas la validité des autres clauses.
          </p>

          <h2>Article 15 – Modifications des CGV</h2>
          <p>
            Passerelle Jeunesse se réserve le droit de modifier les présentes CGV à tout moment.
            Les CGV applicables sont celles en vigueur au moment de la réservation.
          </p>

          <h2>Article 16 – Contact</h2>
          <p>
            Pour toute question concernant les présentes CGV :
          </p>
          <p className="ml-6">
            <strong>Passerelle Jeunesse</strong><br />
            Nathan Imogo<br />
            Email : <a href="mailto:contact@passerellejeunesse.fr">contact@passerellejeunesse.fr</a><br />
            Téléphone : 06 19 22 62 94<br />
            Site web : <a href="https://www.passerellejeunesse.fr">www.passerellejeunesse.fr</a>
          </p>

          <div className="mt-12 p-6 bg-muted rounded-lg">
            <p className="text-sm text-center">
              <strong>En réservant une prestation Passerelle Jeunesse, vous reconnaissez avoir pris connaissance
              et accepter l'intégralité des présentes Conditions Générales de Vente.</strong>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
