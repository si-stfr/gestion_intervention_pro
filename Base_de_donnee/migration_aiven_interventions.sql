-- Migration Aiven: aligner les ENUM avec le backend et le frontend.
USE `gestion_integration`;

ALTER TABLE `interventions`
  MODIFY `urgence` ENUM('Très haute', 'Haute', 'Moyenne', 'Basse', 'Très basse') NOT NULL,
  MODIFY `type_intervention` ENUM('Livraison', 'Installation', 'Livraison + Installation', 'Stockage', 'Prêt de Matériel', 'Mise à jour', 'Autre') NOT NULL;