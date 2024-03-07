<?php

declare(strict_types=1);

namespace Neos\Flow\Persistence\Doctrine\Migrations;

use Doctrine\DBAL\Platforms\PostgreSQL100Platform;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20240223075804 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Adds the path column to AssetCollections';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(!$this->connection->getDatabasePlatform() instanceof PostgreSQL100Platform, 'Migration can only be executed safely on "postgresql".');

        $this->addSql('ALTER TABLE neos_media_domain_model_assetcollection ADD path VARCHAR(1000) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(!$this->connection->getDatabasePlatform() instanceof PostgreSQL100Platform, 'Migration can only be executed safely on "postgresql".');

        $this->addSql('ALTER TABLE neos_media_domain_model_assetcollection DROP path');
    }
}
