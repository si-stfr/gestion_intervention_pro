-- Migration Aiven: aligner les ENUM avec le backend et le frontend.
USE `gestion_integration`;

ALTER TABLE `interventions`
  MODIFY `urgence` ENUM('Très haute', 'Haute', 'Moyenne', 'Basse', 'Très basse') NOT NULL,
  MODIFY `priorite` ENUM('Majeure', 'Très Haute', 'Très haute', 'Moyenne', 'Basse', 'Très basse') NOT NULL,
  MODIFY `type_intervention` ENUM('Livraison', 'Installation', 'Livraison + Installation', 'Stockage', 'Prêt de Matériel', 'Mise à jour', 'Autre') NOT NULL;

UPDATE `interventions`
SET `priorite` = 'Très haute'
WHERE `priorite` = 'Très Haute';

ALTER TABLE `interventions`
  MODIFY `priorite` ENUM('Majeure', 'Très haute', 'Moyenne', 'Basse', 'Très basse') NOT NULL;