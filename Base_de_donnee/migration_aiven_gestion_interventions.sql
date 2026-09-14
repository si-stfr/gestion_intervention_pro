-- Migration Aiven: aligner les ENUM avec le backend et le frontend.
USE `gestion_intervention`;

ALTER TABLE `interventions`
  MODIFY `urgence` ENUM('Très haute', 'Haute', 'Moyenne', 'Basse', 'Très basse') NOT NULL,
  MODIFY `type_intervention` ENUM('Livraison', 'Installation', 'Livraison + Installation', 'Stockage', 'Prêt de Matériel', 'Mise à jour', 'Autre') NOT NULL;

ALTER TABLE `interventions`
  MODIFY `priorite` VARCHAR(50) NOT NULL;

UPDATE `interventions`
SET `priorite` = 'Très haute'
WHERE `priorite` = 'Très Haute';

ALTER TABLE `interventions`
  MODIFY `priorite` ENUM('Majeure', 'Très haute', 'Moyenne', 'Basse', 'Très basse') NOT NULL;